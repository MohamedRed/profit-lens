import { Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db } from "../firebase_admin";
import { assertAdminAccess } from "./authz";
import { adminCallableConfig } from "./constants";
import { logAdminCall } from "./logging";
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
    activeUsersCurrent,
    activeUsersPrevious,
    offersCurrent,
    offersPrevious,
    offerProfitabilityCurrent,
    ticketSummaryCurrent,
    ticketsPrevious,
  ] = await Promise.all([
    countDocs(db.collection("users")),
    countDocs(db.collection("users").where("updatedAt", ">=", Timestamp.fromDate(currentStart))),
    countDocs(
      db
        .collection("users")
        .where("updatedAt", ">=", Timestamp.fromDate(previousStart))
        .where("updatedAt", "<", Timestamp.fromDate(currentStart))
    ),
    countDocs(db.collectionGroup("offers").where("createdAt", ">=", Timestamp.fromDate(currentStart))),
    countDocs(
      db
        .collectionGroup("offers")
        .where("createdAt", ">=", Timestamp.fromDate(previousStart))
        .where("createdAt", "<", Timestamp.fromDate(currentStart))
    ),
    summarizeOfferProfitability({
      from: currentStart,
      to: now,
    }),
    summarizeTickets({ from: currentStart, to: now }),
    countDocs(
      db
        .collectionGroup("helpTickets")
        .where("updatedAt", ">=", Timestamp.fromDate(previousStart))
        .where("updatedAt", "<", Timestamp.fromDate(currentStart))
    ),
  ]);
  const paidFree = await summarizePaidVsFree(totalUsers);

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

async function summarizeOfferProfitability(params: {
  from: Date;
  to: Date;
}): Promise<{ positive: number; negative: number }> {
  let query: FirebaseFirestore.Query = db
    .collectionGroup("offers")
    .where("createdAt", ">=", Timestamp.fromDate(params.from))
    .where("createdAt", "<=", Timestamp.fromDate(params.to))
    .select("breakdown");

  const snapshot = await query.get();
  let positive = 0;
  let negative = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data() as Record<string, unknown>;
    const breakdown = (data.breakdown ?? {}) as Record<string, unknown>;
    const netProfit = typeof breakdown.netProfit === "number"
      ? breakdown.netProfit
      : typeof breakdown.netProfitEuro === "number"
        ? breakdown.netProfitEuro
        : 0;

    if (netProfit > 0) {
      positive += 1;
    } else if (netProfit < 0) {
      negative += 1;
    }
  }

  return { positive, negative };
}

async function summarizeTickets(params: {
  from: Date;
  to: Date;
}): Promise<{ total: number; open: number; resolved: number }> {
  const snapshot = await db
    .collectionGroup("helpTickets")
    .where("updatedAt", ">=", Timestamp.fromDate(params.from))
    .where("updatedAt", "<=", Timestamp.fromDate(params.to))
    .select("status")
    .get();

  let open = 0;
  let resolved = 0;

  for (const doc of snapshot.docs) {
    const status = (doc.data().status as string | undefined)?.toLowerCase() ?? "";
    if (status === "resolved" || status === "closed") {
      resolved += 1;
    } else {
      open += 1;
    }
  }

  return {
    total: snapshot.docs.length,
    open,
    resolved,
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
