import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { resolveDelivererStatus } from "./help_ticket_deliverer_status";

const REGION = "europe-west1";

export const seedHelpTicketTimeline = onDocumentCreated(
  {
    document: "users/{uid}/helpTickets/{ticketId}",
    region: REGION,
  },
  async (event) => {
    const ticketRef = event.data?.ref;
    const ticketData = event.data?.data();
    if (!ticketRef || !ticketData) {
      return;
    }

    await ticketRef.firestore.runTransaction(async (transaction) => {
      const timelineCollection = ticketRef.collection("delivererTimeline");
      const receivedQuery = timelineCollection.where("status", "==", "received").limit(1);
      const receivedSnapshot = await transaction.get(receivedQuery);
      if (!receivedSnapshot.empty) {
        return;
      }

      const resolution = resolveDelivererStatus({
        status: "open",
        locale: asString(ticketData.locale),
      });
      const createdAt = asTimestamp(ticketData.createdAt);
      transaction.set(timelineCollection.doc(), {
        status: "received",
        message: resolution.delivererStatusMessage,
        at: createdAt ?? FieldValue.serverTimestamp(),
        source: "submission",
      });
    });
  }
);

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asTimestamp(value: unknown): Timestamp | undefined {
  return value instanceof Timestamp ? value : undefined;
}
