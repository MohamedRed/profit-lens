import { FieldPath, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db } from "../firebase_admin";
import { assertAdminAccess } from "./authz";
import { buildFilterKey, decodeCursor, encodeCursor } from "./cursor";
import { adminCallableConfig, ADMIN_DEFAULT_PAGE_SIZE } from "./constants";
import { logAdminCall } from "./logging";
import { maskEmail } from "./masks";
import { readDate, readString, readNumber, toDayRangeStart, toIsoOrNull } from "./readers";
import type {
  AdminHelpTicketRow,
  AdminListUsersResponse,
  AdminOfferRow,
  AdminSortDir,
  AdminUserSnapshotResponse,
  AdminUsersSortBy,
  AdminUserDeviceSummary,
  AdminUserRow,
} from "./types";
import {
  asObject,
  readOptionalBoolean,
  readOptionalEnum,
  readOptionalString,
  readPageSize,
} from "./validation";

const USERS_CURSOR_TYPE = "admin-users";
const SUPPORTED_SORT_BY: readonly AdminUsersSortBy[] = [
  "lastActivityAt",
  "createdAt",
  "offerCount30d",
] as const;
const SUPPORTED_SORT_DIR: readonly AdminSortDir[] = ["asc", "desc"] as const;
const PAID_STATUSES = new Set(["active", "trialing", "past_due"]);

type UsersCursorPayload = {
  lastDocPath: string;
  filterKey: string;
};

type ParsedListUsersRequest = {
  query?: string;
  sortBy: AdminUsersSortBy;
  sortDir: AdminSortDir;
  pageSize: number;
  cursor?: string;
};

type ParsedUserSnapshotRequest = {
  uid: string;
  includeSensitive: boolean;
};

export const adminListUsers = onCall(adminCallableConfig, async (request) => {
  const principal = await assertAdminAccess(request);
  const payload = readListUsersRequest(request.data);
  const response = await listUsers(payload);

  logAdminCall({
    endpoint: "adminListUsers",
    principal,
    requestSummary: {
      query: payload.query ?? null,
      sortBy: payload.sortBy,
      sortDir: payload.sortDir,
      pageSize: payload.pageSize,
      hasCursor: Boolean(payload.cursor),
    },
    responseCount: response.rows.length,
  });

  return response;
});

export const adminGetUserSnapshot = onCall(adminCallableConfig, async (request) => {
  const principal = await assertAdminAccess(request);
  const payload = readUserSnapshotRequest(request.data);
  const response = await getUserSnapshot(payload);

  logAdminCall({
    endpoint: "adminGetUserSnapshot",
    principal,
    requestSummary: {
      uid: payload.uid,
      includeSensitive: payload.includeSensitive,
    },
  });

  return response;
});

function readListUsersRequest(data: unknown): ParsedListUsersRequest {
  const payload = asObject(data);

  return {
    query: readOptionalString(payload, "query", 120),
    sortBy: readOptionalEnum(payload, "sortBy", SUPPORTED_SORT_BY) ?? "lastActivityAt",
    sortDir: readOptionalEnum(payload, "sortDir", SUPPORTED_SORT_DIR) ?? "desc",
    pageSize: readPageSize(payload),
    cursor: readOptionalString(payload, "cursor", 2048),
  };
}

async function listUsers(payload: ParsedListUsersRequest): Promise<AdminListUsersResponse> {
  const now = new Date();
  const metricsStart = toDayRangeStart(now, 30);
  const normalizedQuery = payload.query?.toLowerCase();
  const filterKey = buildFilterKey({
    query: normalizedQuery ?? null,
    sortBy: payload.sortBy,
    sortDir: payload.sortDir,
  });

  const cursor = decodeCursor<UsersCursorPayload>(payload.cursor, USERS_CURSOR_TYPE);
  let cursorDocSnapshot: FirebaseFirestore.DocumentSnapshot | null = null;

  if (cursor) {
    if (cursor.filterKey !== filterKey) {
      throw new HttpsError("invalid-argument", "Cursor does not match current filters.");
    }
    cursorDocSnapshot = await db.doc(cursor.lastDocPath).get();
    if (!cursorDocSnapshot.exists) {
      throw new HttpsError("invalid-argument", "Cursor document no longer exists.");
    }
  }

  const orderField = resolveOrderField(payload.sortBy);
  const baseQuery = db
    .collection("users")
    .orderBy(orderField, payload.sortDir)
    .orderBy(FieldPath.documentId(), payload.sortDir);

  const rows: AdminUserRow[] = [];
  let exhausted = false;
  let scannedDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
  const batchSize = Math.max(payload.pageSize * 2, ADMIN_DEFAULT_PAGE_SIZE);

  while (rows.length < payload.pageSize && !exhausted) {
    let pagedQuery = baseQuery.limit(batchSize);
    if (cursorDocSnapshot) {
      pagedQuery = pagedQuery.startAfter(cursorDocSnapshot);
    }

    const snapshot = await pagedQuery.get();
    if (snapshot.empty) {
      exhausted = true;
      break;
    }

    cursorDocSnapshot = snapshot.docs[snapshot.docs.length - 1] ?? null;
    scannedDoc = snapshot.docs[snapshot.docs.length - 1] ?? scannedDoc;

    const candidateRows = await Promise.all(
      snapshot.docs.map((doc) => buildUserRow(doc, metricsStart))
    );

    const filteredRows = candidateRows.filter((row) => {
      if (!normalizedQuery) {
        return true;
      }
      return (
        row.uid.toLowerCase().includes(normalizedQuery) ||
        (row.emailMasked ?? "").toLowerCase().includes(normalizedQuery)
      );
    });

    const sortedRows = payload.sortBy === "offerCount30d"
      ? sortByOfferCount(filteredRows, payload.sortDir)
      : filteredRows;

    for (const row of sortedRows) {
      rows.push(row);
      if (rows.length >= payload.pageSize) {
        break;
      }
    }

    if (snapshot.docs.length < batchSize) {
      exhausted = true;
    }
  }

  const nextCursor = !exhausted && scannedDoc
    ? encodeCursor(USERS_CURSOR_TYPE, {
        lastDocPath: scannedDoc.ref.path,
        filterKey,
      } satisfies UsersCursorPayload)
    : null;

  return {
    rows,
    nextCursor,
  };
}

function resolveOrderField(sortBy: AdminUsersSortBy): string {
  if (sortBy === "createdAt") {
    return "createdAt";
  }
  return "updatedAt";
}

function sortByOfferCount(rows: AdminUserRow[], sortDir: AdminSortDir): AdminUserRow[] {
  const sorted = [...rows].sort((left, right) => {
    const delta = left.offerCount30d - right.offerCount30d;
    if (delta !== 0) {
      return sortDir === "asc" ? delta : -delta;
    }
    return left.uid.localeCompare(right.uid);
  });
  return sorted;
}

async function buildUserRow(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  metricsStart: Date
): Promise<AdminUserRow> {
  const data = doc.data() as Record<string, unknown>;
  const uid = doc.id;

  const [offerCount30d, helpTicketCount30d, entitlementSnapshot] = await Promise.all([
    countUserCollectionDocs(uid, "offers", "createdAt", metricsStart),
    countUserCollectionDocs(uid, "helpTickets", "updatedAt", metricsStart),
    db.collection("users").doc(uid).collection("entitlements").doc("current").get(),
  ]);

  const entitlement = entitlementSnapshot.data() as Record<string, unknown> | undefined;
  const entitlementPlanId = readString(entitlement?.planId);
  const entitlementStatus = readString(entitlement?.status);
  const isPaid =
    entitlementPlanId != null &&
    entitlementPlanId !== "free" &&
    entitlementStatus != null &&
    PAID_STATUSES.has(entitlementStatus);

  return {
    uid,
    emailMasked: maskEmail(readString(data.email)),
    createdAtIso: toIsoOrNull(readDate(data.createdAt)),
    lastActivityAtIso: toIsoOrNull(readDate(data.updatedAt)),
    offerCount30d,
    helpTicketCount30d,
    entitlementPlanId,
    entitlementStatus,
    isPaid,
  };
}

async function countUserCollectionDocs(
  uid: string,
  collectionName: string,
  dateField: string,
  from: Date
): Promise<number> {
  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection(collectionName)
    .where(dateField, ">=", Timestamp.fromDate(from))
    .count()
    .get();
  return snapshot.data().count;
}

function readUserSnapshotRequest(data: unknown): ParsedUserSnapshotRequest {
  const payload = asObject(data);
  const uid = readOptionalString(payload, "uid", 128);
  if (!uid) {
    throw new HttpsError("invalid-argument", "uid is required.");
  }

  return {
    uid,
    includeSensitive: readOptionalBoolean(payload, "includeSensitive") ?? false,
  };
}

async function getUserSnapshot(
  payload: ParsedUserSnapshotRequest
): Promise<AdminUserSnapshotResponse> {
  const userRef = db.collection("users").doc(payload.uid);
  const [
    userSnap,
    entitlementSnap,
    recentOffersSnap,
    recentTicketsSnap,
    devicesSnap,
  ] = await Promise.all([
    userRef.get(),
    userRef.collection("entitlements").doc("current").get(),
    userRef.collection("offers").orderBy("createdAt", "desc").limit(5).get(),
    userRef.collection("helpTickets").orderBy("updatedAt", "desc").limit(5).get(),
    userRef.collection("devices").orderBy("updatedAt", "desc").limit(10).get(),
  ]);

  if (!userSnap.exists) {
    throw new HttpsError("not-found", `User not found: ${payload.uid}`);
  }

  const userData = userSnap.data() as Record<string, unknown>;
  const userEmail = readString(userData.email);

  const entitlementData = entitlementSnap.data() as Record<string, unknown> | undefined;
  const usagePeriodKey = readString(entitlementData?.periodKey);
  const usageSnap = usagePeriodKey
    ? await userRef.collection("usage").doc(usagePeriodKey).get()
    : null;
  const usageData = usageSnap?.data() as Record<string, unknown> | undefined;

  const recentOffers = recentOffersSnap.docs.map((offerDoc) => {
    const data = offerDoc.data() as Record<string, unknown>;
    return {
      uid: payload.uid,
      offerId: offerDoc.id,
      source: readString(data.source),
      createdAtIso: toIsoOrNull(readDate(data.createdAt)),
      payoutEuro: readNumber(data.payoutEuro),
      distanceKm: readNumber(data.distanceKm),
      durationMinutes: readNumber(data.durationMinutes),
      netProfitEuro: readNumber((data.breakdown as Record<string, unknown> | undefined)?.netProfit),
      profitability: resolveProfitability(readNumber((data.breakdown as Record<string, unknown> | undefined)?.netProfit)),
      pickupSummary: readString(data.pickupAddress),
      dropoffSummary: readString(data.dropoffAddress),
    } satisfies AdminOfferRow;
  });

  const recentTickets = recentTicketsSnap.docs.map((ticketDoc) => {
    const data = ticketDoc.data() as Record<string, unknown>;
    return {
      uid: payload.uid,
      ticketId: ticketDoc.id,
      title: readString(data.title),
      descriptionPreview: readString(data.description),
      status: readString(data.status),
      delivererStatus: readString(data.delivererStatus),
      createdAtIso: toIsoOrNull(readDate(data.createdAt)),
      updatedAtIso: toIsoOrNull(readDate(data.updatedAt)),
      emailMasked: maskEmail(userEmail),
    } satisfies AdminHelpTicketRow;
  });

  const devices = devicesSnap.docs.map((deviceDoc) => {
    const data = deviceDoc.data() as Record<string, unknown>;
    return {
      deviceId: deviceDoc.id,
      platform: readString(data.platform),
      active: readBooleanOrDefault(data.active, true),
      firstSeenIso: toIsoOrNull(readDate(data.firstSeen)),
      lastSeenIso: toIsoOrNull(readDate(data.lastSeen)),
    } satisfies AdminUserDeviceSummary;
  });

  return {
    user: {
      uid: payload.uid,
      emailMasked: maskEmail(userEmail),
      email: payload.includeSensitive ? userEmail : null,
      createdAtIso: toIsoOrNull(readDate(userData.createdAt)),
      lastActivityAtIso: toIsoOrNull(readDate(userData.updatedAt)),
      countryCode: readString(userData.countryCode),
      currencyCode: readString(userData.currencyCode),
      preferredLocale: readString(userData.preferredLocale),
      minProfitabilityEuro: readNumber(userData.minProfitabilityEuro),
    },
    entitlement: {
      planId: readString(entitlementData?.planId),
      status: readString(entitlementData?.status),
      source: readString(entitlementData?.source),
      offerLimit: readNumber(entitlementData?.offerLimit),
      periodStartIso: toIsoOrNull(readDate(entitlementData?.periodStart)),
      periodEndIso: toIsoOrNull(readDate(entitlementData?.periodEnd)),
      periodKey: usagePeriodKey,
      cancelAtPeriodEnd:
        typeof entitlementData?.cancelAtPeriodEnd === "boolean"
          ? entitlementData.cancelAtPeriodEnd
          : null,
    },
    usage: {
      periodKey: usagePeriodKey,
      offerCount: readNumber(usageData?.offerCount) ?? 0,
    },
    recentOffers,
    recentTickets,
    devices,
  };
}

function resolveProfitability(value: number | null): "positive" | "negative" | "neutral" {
  if (value == null || value === 0) {
    return "neutral";
  }
  return value > 0 ? "positive" : "negative";
}

function readBooleanOrDefault(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}
