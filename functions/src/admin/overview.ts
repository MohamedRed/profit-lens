import { Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db } from "../firebase_admin";
import { assertAdminAccess } from "./authz";
import { adminCallableConfig } from "./constants";
import { logAdminCall } from "./logging";
import {
  buildOverviewSeries,
  summarizeOfferProfitabilityFromDocs,
  summarizeTicketsFromDocs,
} from "./overview_series";
import { toDayRangeStart } from "./readers";
import type {
  AdminGetOverviewRequest,
  AdminGetOverviewResponse,
  AdminKpiDelta,
  AdminRangeDays,
} from "./types";
import { asObject } from "./validation";

const allowedRanges: readonly AdminRangeDays[] = [7, 30, 90] as const;
const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

export const adminGetOverview = onCall(adminCallableConfig, async (request) => {
  const principal = await assertAdminAccess(request);
  const payload = readRequest(request.data);

  const now = new Date();
  const currentStart = toDayRangeStart(now, payload.rangeDays);
  const previousStart = toDayRangeStart(currentStart, payload.rangeDays);

  const [
    totalUsers,
    activeUsersCurrentSnapshot,
    activeUsersPrevious,
    offersCurrentSnapshot,
    offersPrevious,
    ticketsCurrentSnapshot,
    ticketsPrevious,
  ] = await Promise.all([
    countDocs(db.collection("users")),
    db
      .collection("users")
      .where("updatedAt", ">=", Timestamp.fromDate(currentStart))
      .select("updatedAt")
      .get(),
    countDocs(
      db
        .collection("users")
        .where("updatedAt", ">=", Timestamp.fromDate(previousStart))
        .where("updatedAt", "<", Timestamp.fromDate(currentStart))
    ),
    db
      .collectionGroup("offers")
      .where("createdAt", ">=", Timestamp.fromDate(currentStart))
      .where("createdAt", "<=", Timestamp.fromDate(now))
      .select("createdAt", "breakdown", "netProfit", "netProfitEuro")
      .get(),
    countDocs(
      db
        .collectionGroup("offers")
        .where("createdAt", ">=", Timestamp.fromDate(previousStart))
        .where("createdAt", "<", Timestamp.fromDate(currentStart))
    ),
    db
      .collectionGroup("helpTickets")
      .where("updatedAt", ">=", Timestamp.fromDate(currentStart))
      .where("updatedAt", "<=", Timestamp.fromDate(now))
      .select("updatedAt", "status")
      .get(),
    countDocs(
      db
        .collectionGroup("helpTickets")
        .where("updatedAt", ">=", Timestamp.fromDate(previousStart))
        .where("updatedAt", "<", Timestamp.fromDate(currentStart))
    ),
  ]);

  const activeUsersCurrent = activeUsersCurrentSnapshot.docs.length;
  const offersCurrent = offersCurrentSnapshot.docs.length;
  const offerProfitabilityCurrent = summarizeOfferProfitabilityFromDocs(offersCurrentSnapshot.docs);
  const ticketSummaryCurrent = summarizeTicketsFromDocs(ticketsCurrentSnapshot.docs);
  const paidFree = await summarizePaidVsFree(totalUsers);
  const series = buildOverviewSeries({
    from: currentStart,
    to: now,
    activeUsersDocs: activeUsersCurrentSnapshot.docs,
    offerDocs: offersCurrentSnapshot.docs,
    ticketDocs: ticketsCurrentSnapshot.docs,
  });

  const response: AdminGetOverviewResponse = {
    rangeDays: payload.rangeDays,
    generatedAtIso: now.toISOString(),
    kpis: {
      totalUsers,
      activeUsersInRange: activeUsersCurrent,
      offersInRange: offersCurrent,
      positiveOffersInRange: offerProfitabilityCurrent.positive,
      negativeOffersInRange: offerProfitabilityCurrent.negative,
      openTicketsInRange: ticketSummaryCurrent.open,
      resolvedTicketsInRange: ticketSummaryCurrent.resolved,
      paidUsers: paidFree.paidUsers,
      freeUsers: paidFree.freeUsers,
    },
    deltas: {
      activeUsersInRange: buildDelta(activeUsersCurrent, activeUsersPrevious),
      offersInRange: buildDelta(offersCurrent, offersPrevious),
      ticketsInRange: buildDelta(ticketSummaryCurrent.total, ticketsPrevious),
    },
    series,
  };

  logAdminCall({
    endpoint: "adminGetOverview",
    principal,
    requestSummary: {
      rangeDays: payload.rangeDays,
    },
  });

  return response;
});

function readRequest(data: unknown): Required<AdminGetOverviewRequest> {
  const payload = asObject(data);
  const rawRange = payload.rangeDays;
  if (rawRange != null && typeof rawRange !== "number") {
    throw new HttpsError("invalid-argument", "rangeDays must be a number.");
  }
  if (rawRange != null && !allowedRanges.includes(rawRange as AdminRangeDays)) {
    throw new HttpsError("invalid-argument", "rangeDays must be one of 7, 30, 90.");
  }
  const rangeDays = (rawRange as AdminRangeDays | undefined) ?? 30;

  return {
    rangeDays,
  };
}

async function countDocs(query: FirebaseFirestore.Query): Promise<number> {
  const snapshot = await query.count().get();
  return snapshot.data().count;
}

function buildDelta(currentValue: number, previousValue: number): AdminKpiDelta {
  const absoluteChange = currentValue - previousValue;
  const percentChange =
    previousValue === 0
      ? currentValue === 0
        ? 0
        : null
      : (absoluteChange / previousValue) * 100;

  return {
    previousValue,
    absoluteChange,
    percentChange,
    trend:
      absoluteChange > 0
        ? "up"
        : absoluteChange < 0
          ? "down"
          : "flat",
  };
}

async function summarizePaidVsFree(totalUsers: number): Promise<{
  paidUsers: number;
  freeUsers: number;
}> {
  const snapshot = await db.collectionGroup("entitlements").get();
  let paidUsers = 0;
  let freeUsers = 0;

  for (const doc of snapshot.docs) {
    if (doc.id !== "current") {
      continue;
    }
    const data = doc.data() as Record<string, unknown>;
    const planId = (data.planId as string | undefined) ?? "free";
    const status = (data.status as string | undefined) ?? "free";
    const isPaid = planId !== "free" && PAID_STATUSES.has(status);
    if (isPaid) {
      paidUsers += 1;
    } else {
      freeUsers += 1;
    }
  }

  if (paidUsers + freeUsers < totalUsers) {
    freeUsers = Math.max(freeUsers, totalUsers - paidUsers);
  }

  return { paidUsers, freeUsers };
}
