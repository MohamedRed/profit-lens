import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import { auth, db, messaging } from "./firebase_admin";

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

    const beforeMessage = (before.statusMessage as string | undefined) ?? null;
    const afterMessage = (after.statusMessage as string | undefined) ?? null;
    const afterStatus = (after.status as string | undefined) ?? null;

    if (beforeMessage === afterMessage) {
      return;
    }

    if (!afterMessage) {
      return;
    }

    if (afterStatus === "triaging") {
      return;
    }

    const uid = event.params.uid as string;
    const ticketId = event.params.ticketId as string;
    const title = "Ticket update";
    const body = afterMessage;

    await sendPushNotifications({ uid, title, body, ticketId, status: afterStatus });
    await queueEmailNotification({ uid, title, body, ticketId });
  }
);

async function sendPushNotifications(params: {
  uid: string;
  title: string;
  body: string;
  ticketId: string;
  status: string | null;
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

async function queueEmailNotification(params: {
  uid: string;
  title: string;
  body: string;
  ticketId: string;
}) {
  try {
    const userRecord = await auth.getUser(params.uid);
    const email = userRecord.email;
    if (!email) return;

    await db.collection("mail").add({
      to: email,
      message: {
        subject: params.title,
        text: `${params.body}\n\nTicket ID: ${params.ticketId}`,
      },
    });
  } catch (error) {
    logger.warn("Failed to queue email notification", {
      uid: params.uid,
      ticketId: params.ticketId,
      error,
    });
  }
}
