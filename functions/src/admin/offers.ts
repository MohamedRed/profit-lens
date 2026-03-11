import { FieldPath } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db } from "../firebase_admin";
import { assertAdminAccess } from "./authz";
import { adminCallableConfig } from "./constants";
import { buildFilterKey, decodeCursor, encodeCursor } from "./cursor";
import { logAdminCall } from "./logging";
import { summarizeAddress } from "./masks";
import {
  readDate,
  readDocumentUid,
  readNetProfit,
  readNumber,
  readString,
  toIsoOrNull,
} from "./readers";
import type {
  AdminListOffersResponse,
  AdminOfferRow,
  AdminOfferSource,
  AdminProfitabilityFilter,
} from "./types";
import {
  asObject,
  readOptionalEnum,
  readOptionalIsoDate,
  readOptionalString,
  readPageSize,
} from "./validation";

const OFFERS_CURSOR_TYPE = "admin-offers";
const SUPPORTED_SOURCE: readonly AdminOfferSource[] = [
  "manual",
  "screenshot",
  "android_accessibility_live",
] as const;
const SUPPORTED_PROFITABILITY: readonly AdminProfitabilityFilter[] = [
  "positive",
  "negative",
] as const;

type OffersCursorPayload = {
  lastDocPath: string;
  filterKey: string;
};

type ParsedListOffersRequest = {
  uid?: string;
  source?: AdminOfferSource;
  dateFromIso?: string;
  dateToIso?: string;
  profitability?: AdminProfitabilityFilter;
  pageSize: number;
  cursor?: string;
};

export const adminListOffers = onCall(adminCallableConfig, async (request) => {
  const principal = await assertAdminAccess(request);
  const payload = readListOffersRequest(request.data);
  const response = await listOffers(payload);

  logAdminCall({
    endpoint: "adminListOffers",
    principal,
    requestSummary: {
      uid: payload.uid ?? null,
      source: payload.source ?? null,
      dateFromIso: payload.dateFromIso ?? null,
      dateToIso: payload.dateToIso ?? null,
      profitability: payload.profitability ?? null,
      pageSize: payload.pageSize,
      hasCursor: Boolean(payload.cursor),
    },
    responseCount: response.rows.length,
  });

  return response;
});

function readListOffersRequest(data: unknown): ParsedListOffersRequest {
  const payload = asObject(data);
  const dateFrom = readOptionalIsoDate(payload, "dateFromIso");
  const dateTo = readOptionalIsoDate(payload, "dateToIso");

  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new HttpsError("invalid-argument", "dateFromIso must be before dateToIso.");
  }

  return {
    uid: readOptionalString(payload, "uid", 128),
    source: readOptionalEnum(payload, "source", SUPPORTED_SOURCE),
    dateFromIso: dateFrom?.toISOString(),
    dateToIso: dateTo?.toISOString(),
    profitability: readOptionalEnum(payload, "profitability", SUPPORTED_PROFITABILITY),
    pageSize: readPageSize(payload),
    cursor: readOptionalString(payload, "cursor", 2048),
  };
}

async function listOffers(
  payload: ParsedListOffersRequest
): Promise<AdminListOffersResponse> {
  const dateFrom = payload.dateFromIso ? new Date(payload.dateFromIso) : undefined;
  const dateTo = payload.dateToIso ? new Date(payload.dateToIso) : undefined;

  const filterKey = buildFilterKey({
    uid: payload.uid ?? null,
    source: payload.source ?? null,
    dateFromIso: payload.dateFromIso ?? null,
    dateToIso: payload.dateToIso ?? null,
    profitability: payload.profitability ?? null,
  });

  const cursor = decodeCursor<OffersCursorPayload>(payload.cursor, OFFERS_CURSOR_TYPE);
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

  const baseQuery = payload.uid
    ? db
        .collection("users")
        .doc(payload.uid)
        .collection("offers")
        .orderBy("createdAt", "desc")
        .orderBy(FieldPath.documentId(), "desc")
    : db
        .collectionGroup("offers")
        .orderBy("createdAt", "desc")
        .orderBy(FieldPath.documentId(), "desc");

  const rows: AdminOfferRow[] = [];
  let exhausted = false;
  let scannedDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null;
  const batchSize = Math.max(payload.pageSize * 2, 20);

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

    for (const doc of snapshot.docs) {
      const row = mapOfferRow(doc, payload.uid);
      if (!row) {
        continue;
      }
      if (!matchesOfferFilters(row, payload.source, payload.profitability, dateFrom, dateTo)) {
        continue;
      }
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
    ? encodeCursor(OFFERS_CURSOR_TYPE, {
        lastDocPath: scannedDoc.ref.path,
        filterKey,
      } satisfies OffersCursorPayload)
    : null;

  return {
    rows,
    nextCursor,
  };
}

function mapOfferRow(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  scopedUid?: string
): AdminOfferRow | null {
  const data = doc.data() as Record<string, unknown>;
  const createdAt = readDate(data.createdAt);
  if (!createdAt) {
    return null;
  }

  const uid = scopedUid ?? readDocumentUid(doc.ref.path);
  if (!uid) {
    return null;
  }

  const netProfit = readNetProfit(data);

  return {
    uid,
    offerId: doc.id,
    source: readString(data.source),
    createdAtIso: toIsoOrNull(createdAt),
    payoutEuro: readNumber(data.payoutEuro),
    distanceKm: readNumber(data.distanceKm),
    durationMinutes: readNumber(data.durationMinutes),
    netProfitEuro: netProfit,
    profitability: netProfit == null || netProfit === 0
      ? "neutral"
      : netProfit > 0
        ? "positive"
        : "negative",
    pickupSummary: summarizeAddress(readString(data.pickupAddress)),
    dropoffSummary: summarizeAddress(readString(data.dropoffAddress)),
  };
}

function matchesOfferFilters(
  row: AdminOfferRow,
  source?: AdminOfferSource,
  profitability?: AdminProfitabilityFilter,
  dateFrom?: Date,
  dateTo?: Date
): boolean {
  if (source && row.source !== source) {
    return false;
  }

  if (profitability && row.profitability !== profitability) {
    return false;
  }

  if (dateFrom || dateTo) {
    if (!row.createdAtIso) {
      return false;
    }
    const createdAt = new Date(row.createdAtIso);
    if (Number.isNaN(createdAt.getTime())) {
      return false;
    }
    if (dateFrom && createdAt < dateFrom) {
      return false;
    }
    if (dateTo && createdAt > dateTo) {
      return false;
    }
  }

  return true;
}
