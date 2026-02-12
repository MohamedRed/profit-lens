import { FieldValue, QueryDocumentSnapshot, Timestamp } from "firebase-admin/firestore";
import { db } from "../firebase_admin";
import { resolveDelivererStatus } from "../help_ticket_deliverer_status";

const PAGE_SIZE = 200;

async function runBackfill() {
  let scanned = 0;
  let updated = 0;
  let lastDoc: QueryDocumentSnapshot | undefined;

  while (true) {
    let query = db
      .collectionGroup("helpTickets")
      .orderBy("__name__")
      .limit(PAGE_SIZE);
    if (lastDoc) {
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
      break;
    }

    for (const doc of snapshot.docs) {
      scanned += 1;
      const timelineCollection = doc.ref.collection("delivererTimeline");
      const existingTimeline = await timelineCollection.limit(1).get();
      if (!existingTimeline.empty) {
        continue;
      }

      const data = doc.data();
      const locale = asString(data.locale);
      const receivedResolution = resolveDelivererStatus({
        status: "open",
        locale,
      });
      const resolvedStatus = resolveStatusForBackfill(data);
      const resolvedMessage = resolveMessageForBackfill(data, resolvedStatus);

      const createdAt = asTimestamp(data.createdAt) ?? asTimestamp(data.updatedAt);
      const currentAt =
        asTimestamp(data.delivererStatusUpdatedAt) ??
        asTimestamp(data.updatedAt) ??
        createdAt;

      const batch = db.batch();
      batch.set(timelineCollection.doc(), {
        status: "received",
        message: receivedResolution.delivererStatusMessage,
        at: createdAt ?? FieldValue.serverTimestamp(),
        source: "backfill",
      });

      const shouldWriteCurrent =
        resolvedStatus !== "received" ||
        resolvedMessage !== receivedResolution.delivererStatusMessage;
      if (shouldWriteCurrent) {
        batch.set(timelineCollection.doc(), {
          status: resolvedStatus,
          message: resolvedMessage,
          at: currentAt ?? FieldValue.serverTimestamp(),
          source: "backfill",
        });
      }

      await batch.commit();
      updated += 1;
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    console.log(
      `[timeline-backfill] scanned=${scanned} updated=${updated} last=${lastDoc.ref.path}`
    );

    if (snapshot.size < PAGE_SIZE) {
      break;
    }
  }

  console.log(`[timeline-backfill] completed scanned=${scanned} updated=${updated}`);
}

function resolveStatusForBackfill(data: Record<string, unknown>) {
  const explicitStatus = asString(data.delivererStatus);
  if (isKnownDelivererStatus(explicitStatus)) {
    return explicitStatus;
  }
  return resolveDelivererStatus({
    status: asString(data.status),
    codingAgentStatus: asString(data.codingAgentStatus),
    aiNeedsUserAction: asBoolean(data.aiNeedsUserAction),
    locale: asString(data.locale),
  }).delivererStatus;
}

function resolveMessageForBackfill(
  data: Record<string, unknown>,
  resolvedStatus: string
) {
  const explicitMessage = asString(data.delivererStatusMessage)?.trim();
  if (explicitMessage) {
    return explicitMessage;
  }
  return resolveDelivererStatus({
    status: resolvedStatus,
    locale: asString(data.locale),
  }).delivererStatusMessage;
}

function isKnownDelivererStatus(value?: string) {
  return (
    value === "received" ||
    value === "analyzing" ||
    value === "needs_info" ||
    value === "fix_ready" ||
    value === "resolved"
  );
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asTimestamp(value: unknown): Timestamp | undefined {
  return value instanceof Timestamp ? value : undefined;
}

runBackfill()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("[timeline-backfill] failed", error);
    process.exitCode = 1;
  });
