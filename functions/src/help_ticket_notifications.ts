import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { db, messaging } from "./firebase_admin";

const REGION = "europe-west1";

export const notifyHelpTicketStatus = onDocumentUpdated(
  {
    document: "users/{uid}/helpTickets/{ticketId}",
    region: REGION,
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const afterMessage =
      (after.delivererStatusMessage as string | undefined) ?? null;
    const beforeDelivererStatus =
      (before.delivererStatus as string | undefined) ?? null;
    const afterStatus = (after.status as string | undefined) ?? null;
    const afterDelivererStatus =
      (after.delivererStatus as string | undefined) ?? null;

    if (
      !hasDelivererStatusChanged(
        beforeDelivererStatus,
        afterDelivererStatus
      )
    ) {
      return;
    }

    if (!afterMessage) {
      return;
    }

    const uid = event.params.uid as string;
    const ticketId = event.params.ticketId as string;

    await sendPushNotifications({
      uid,
      title: "Ticket update",
      body: afterMessage,
      ticketId,
      status: afterStatus,
      delivererStatus: afterDelivererStatus,
    });
  }
);

async function sendPushNotifications(params: {
  uid: string;
  title: string;
  body: string;
  ticketId: string;
  status: string | null;
  delivererStatus: string | null;
}) {
  const tokensSnap = await db
    .collection("users")
    .doc(params.uid)
    .collection("notificationTokens")
    .get();

  const tokens = tokensSnap.docs.map((doc) => doc.id).filter(Boolean);
  if (tokens.length === 0) {
    return;
  }

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: params.title,
      body: params.body,
    },
    data: {
      ticketId: params.ticketId,
      status: params.status ?? "",
      delivererStatus: params.delivererStatus ?? "",
    },
  });

  const invalidTokens: string[] = [];
  response.responses.forEach((result, index) => {
    if (result.success) return;
    const code = result.error?.code ?? "";
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      invalidTokens.push(tokens[index]);
    }
  });

  if (invalidTokens.length > 0) {
    await Promise.all(
      invalidTokens.map((token) =>
        db
          .collection("users")
          .doc(params.uid)
          .collection("notificationTokens")
          .doc(token)
          .delete()
      )
    );
  }
}

export function hasDelivererStatusChanged(
  beforeDelivererStatus: string | null,
  afterDelivererStatus: string | null
) {
  return beforeDelivererStatus !== afterDelivererStatus;
}
