import { FieldPath } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db } from "../firebase_admin";
import { assertAdminAccess } from "./authz";
import { adminCallableConfig } from "./constants";
import { buildFilterKey, decodeCursor, encodeCursor } from "./cursor";
import { logAdminCall } from "./logging";
import { maskEmail, maskTextPreview } from "./masks";
import {
  readDate,
  readDocumentUid,
  readNumber,
  readString,
  toIsoOrNull,
} from "./readers";
import type {
  AdminGetHelpTicketDetailResponse,
  AdminHelpTicketDetailAttachment,
  AdminHelpTicketDetailTimelineEvent,
  AdminHelpTicketRow,
  AdminListHelpTicketsResponse,
} from "./types";
import {
  asObject,
  readOptionalBoolean,
  readOptionalIsoDate,
  readOptionalString,
  readPageSize,
} from "./validation";

const TICKETS_CURSOR_TYPE = "admin-help-tickets";

type TicketsCursorPayload = {
  lastDocPath: string;
  filterKey: string;
};

type ParsedListHelpTicketsRequest = {
  uid?: string;
  status?: string;
  delivererStatus?: string;
  dateFromIso?: string;
  dateToIso?: string;
  pageSize: number;
  cursor?: string;
};

type ParsedTicketDetailRequest = {
  uid: string;
  ticketId: string;
  includeSensitive: boolean;
};

export const adminListHelpTickets = onCall(adminCallableConfig, async (request) => {
  const principal = await assertAdminAccess(request);
  const payload = readListHelpTicketsRequest(request.data);
  const response = await listHelpTickets(payload);

  logAdminCall({
    endpoint: "adminListHelpTickets",
    principal,
    requestSummary: {
      uid: payload.uid ?? null,
      status: payload.status ?? null,
      delivererStatus: payload.delivererStatus ?? null,
      dateFromIso: payload.dateFromIso ?? null,
      dateToIso: payload.dateToIso ?? null,
      pageSize: payload.pageSize,
      hasCursor: Boolean(payload.cursor),
    },
    responseCount: response.rows.length,
  });

  return response;
});

export const adminGetHelpTicketDetail = onCall(adminCallableConfig, async (request) => {
  const principal = await assertAdminAccess(request);
  const payload = readTicketDetailRequest(request.data);
  const response = await getTicketDetail(payload);

  logAdminCall({
    endpoint: "adminGetHelpTicketDetail",
    principal,
    requestSummary: {
      uid: payload.uid,
      ticketId: payload.ticketId,
      includeSensitive: payload.includeSensitive,
    },
  });

  return response;
});

function readListHelpTicketsRequest(data: unknown): ParsedListHelpTicketsRequest {
  const payload = asObject(data);
  const dateFrom = readOptionalIsoDate(payload, "dateFromIso");
  const dateTo = readOptionalIsoDate(payload, "dateToIso");

  if (dateFrom && dateTo && dateFrom > dateTo) {
    throw new HttpsError("invalid-argument", "dateFromIso must be before dateToIso.");
  }

  return {
    uid: readOptionalString(payload, "uid", 128),
    status: readOptionalString(payload, "status", 64),
    delivererStatus: readOptionalString(payload, "delivererStatus", 64),
    dateFromIso: dateFrom?.toISOString(),
    dateToIso: dateTo?.toISOString(),
    pageSize: readPageSize(payload),
    cursor: readOptionalString(payload, "cursor", 2048),
  };
}

async function listHelpTickets(
  payload: ParsedListHelpTicketsRequest
): Promise<AdminListHelpTicketsResponse> {
  const dateFrom = payload.dateFromIso ? new Date(payload.dateFromIso) : undefined;
  const dateTo = payload.dateToIso ? new Date(payload.dateToIso) : undefined;

  const filterKey = buildFilterKey({
    uid: payload.uid ?? null,
    status: payload.status ?? null,
    delivererStatus: payload.delivererStatus ?? null,
    dateFromIso: payload.dateFromIso ?? null,
    dateToIso: payload.dateToIso ?? null,
  });

  const cursor = decodeCursor<TicketsCursorPayload>(payload.cursor, TICKETS_CURSOR_TYPE);
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
        .collection("helpTickets")
        .orderBy("updatedAt", "desc")
        .orderBy(FieldPath.documentId(), "desc")
    : db
        .collectionGroup("helpTickets")
        .orderBy("updatedAt", "desc")
        .orderBy(FieldPath.documentId(), "desc");

  const rows: AdminHelpTicketRow[] = [];
  const statusCounters: Record<string, number> = {};
  const delivererStatusCounters: Record<string, number> = {};
  const emailCache = new Map<string, string | null>();

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
      const row = await mapHelpTicketRow(doc, payload.uid, emailCache);
      if (!row) {
        continue;
      }
      if (!matchesTicketFilters(row, payload.status, payload.delivererStatus, dateFrom, dateTo)) {
        continue;
      }

      const statusKey = row.status ?? "unknown";
      const delivererStatusKey = row.delivererStatus ?? "unknown";
      statusCounters[statusKey] = (statusCounters[statusKey] ?? 0) + 1;
      delivererStatusCounters[delivererStatusKey] =
        (delivererStatusCounters[delivererStatusKey] ?? 0) + 1;

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
    ? encodeCursor(TICKETS_CURSOR_TYPE, {
        lastDocPath: scannedDoc.ref.path,
        filterKey,
      } satisfies TicketsCursorPayload)
    : null;

  return {
    rows,
    counters: {
      byStatus: statusCounters,
      byDelivererStatus: delivererStatusCounters,
    },
    nextCursor,
  };
}

async function mapHelpTicketRow(
  doc: FirebaseFirestore.QueryDocumentSnapshot,
  scopedUid: string | undefined,
  emailCache: Map<string, string | null>
): Promise<AdminHelpTicketRow | null> {
  const data = doc.data() as Record<string, unknown>;
  const uid = scopedUid ?? readDocumentUid(doc.ref.path);
  if (!uid) {
    return null;
  }

  const emailMasked = await readMaskedEmail(uid, emailCache);

  return {
    uid,
    ticketId: doc.id,
    title: readString(data.title),
    descriptionPreview: maskTextPreview(readString(data.description)),
    status: readString(data.status),
    delivererStatus: readString(data.delivererStatus),
    createdAtIso: toIsoOrNull(readDate(data.createdAt)),
    updatedAtIso: toIsoOrNull(readDate(data.updatedAt)),
    emailMasked,
  };
}

async function readMaskedEmail(
  uid: string,
  emailCache: Map<string, string | null>
): Promise<string | null> {
  if (emailCache.has(uid)) {
    return emailCache.get(uid) ?? null;
  }
  const userSnap = await db.collection("users").doc(uid).get();
  const userData = userSnap.data() as Record<string, unknown> | undefined;
  const masked = maskEmail(readString(userData?.email));
  emailCache.set(uid, masked);
  return masked;
}

function matchesTicketFilters(
  row: AdminHelpTicketRow,
  status?: string,
  delivererStatus?: string,
  dateFrom?: Date,
  dateTo?: Date
): boolean {
  if (status && row.status !== status) {
    return false;
  }
  if (delivererStatus && row.delivererStatus !== delivererStatus) {
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

function readTicketDetailRequest(data: unknown): ParsedTicketDetailRequest {
  const payload = asObject(data);
  const uid = readOptionalString(payload, "uid", 128);
  const ticketId = readOptionalString(payload, "ticketId", 128);

  if (!uid || !ticketId) {
    throw new HttpsError("invalid-argument", "uid and ticketId are required.");
  }

  return {
    uid,
    ticketId,
    includeSensitive: readOptionalBoolean(payload, "includeSensitive") ?? false,
  };
}

async function getTicketDetail(
  payload: ParsedTicketDetailRequest
): Promise<AdminGetHelpTicketDetailResponse> {
  const ticketRef = db
    .collection("users")
    .doc(payload.uid)
    .collection("helpTickets")
    .doc(payload.ticketId);

  const [ticketSnap, attachmentsSnap, timelineSnap, userSnap] = await Promise.all([
    ticketRef.get(),
    ticketRef.collection("attachments").orderBy("uploadedAt", "asc").get(),
    ticketRef.collection("delivererTimeline").orderBy("at", "desc").get(),
    db.collection("users").doc(payload.uid).get(),
  ]);

  if (!ticketSnap.exists) {
    throw new HttpsError(
      "not-found",
      `Help ticket not found: ${payload.uid}/${payload.ticketId}`
    );
  }

  const ticketData = ticketSnap.data() as Record<string, unknown>;
  const userData = userSnap.data() as Record<string, unknown> | undefined;
  const userEmail = readString(userData?.email);

  const attachments = attachmentsSnap.docs.map((attachmentDoc) => {
    const data = attachmentDoc.data() as Record<string, unknown>;
    const type = readString(data.type);

    return {
      id: attachmentDoc.id,
      type: type === "image" || type === "audio" ? type : "unknown",
      filename: readString(data.filename),
      contentType: readString(data.contentType),
      sizeBytes: readNumber(data.sizeBytes),
      durationSeconds: readNumber(data.durationSeconds),
      uploadedAtIso: toIsoOrNull(readDate(data.uploadedAt)),
      storagePath: payload.includeSensitive ? readString(data.storagePath) : null,
      url: payload.includeSensitive ? readString(data.url) : null,
    } satisfies AdminHelpTicketDetailAttachment;
  });

  const timeline = timelineSnap.docs.map((eventDoc) => {
    const data = eventDoc.data() as Record<string, unknown>;
    return {
      id: eventDoc.id,
      status: readString(data.status),
      message: readString(data.message),
      atIso: toIsoOrNull(readDate(data.at)),
      source: readString(data.source),
    } satisfies AdminHelpTicketDetailTimelineEvent;
  });

  return {
    ticket: {
      uid: payload.uid,
      ticketId: payload.ticketId,
      title: readString(ticketData.title),
      description: readString(ticketData.description),
      status: readString(ticketData.status),
      delivererStatus: readString(ticketData.delivererStatus),
      delivererStatusMessage: readString(ticketData.delivererStatusMessage),
      createdAtIso: toIsoOrNull(readDate(ticketData.createdAt)),
      updatedAtIso: toIsoOrNull(readDate(ticketData.updatedAt)),
      emailMasked: maskEmail(userEmail),
      email: payload.includeSensitive ? userEmail : null,
    },
    attachments,
    timeline,
  };
}
