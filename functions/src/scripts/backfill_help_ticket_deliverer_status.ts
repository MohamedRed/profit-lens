import { FieldValue, QueryDocumentSnapshot } from "firebase-admin/firestore";
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

    const batch = db.batch();
    for (const doc of snapshot.docs) {
      scanned += 1;
      const data = doc.data();
      if (hasDelivererStatusFields(data)) {
        continue;
      }

      const resolution = resolveDelivererStatus({
        status: data.status as string | undefined,
        codingAgentStatus: data.codingAgentStatus as string | undefined,
        aiNeedsUserAction: data.aiNeedsUserAction as boolean | undefined,
        locale: data.locale as string | undefined,
      });

      batch.set(
        doc.ref,
        {
          delivererStatus: resolution.delivererStatus,
          delivererStatusMessage: resolution.delivererStatusMessage,
          delivererStatusUpdatedAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      updated += 1;
    }

    await batch.commit();
    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    console.log(
      `[backfill] scanned=${scanned} updated=${updated} last=${lastDoc.ref.path}`
    );

    if (snapshot.size < PAGE_SIZE) {
      break;
    }
  }

  console.log(`[backfill] completed scanned=${scanned} updated=${updated}`);
}

function hasDelivererStatusFields(data: Record<string, unknown>) {
  return (
    typeof data.delivererStatus === "string" &&
    typeof data.delivererStatusMessage === "string" &&
    data.delivererStatusMessage.trim().length > 0 &&
    Boolean(data.delivererStatusUpdatedAt)
  );
}

runBackfill()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("[backfill] failed", error);
    process.exitCode = 1;
  });
