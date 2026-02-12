import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { defineSecret, defineString } from "firebase-functions/params";
import { db } from "./firebase_admin";
import { runHelpTicketTriage } from "./help_ticket_triage_service";

const REGION = "europe-west1";
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const geminiModel = defineString("GEMINI_TRIAGE_MODEL", {
  default: "gemini-3-flash-preview",
});

export const triageHelpTicket = onDocumentCreated(
  {
    document: "users/{uid}/helpTickets/{ticketId}",
    region: REGION,
    secrets: [geminiApiKey],
    timeoutSeconds: 30,
    memory: "512MiB",
  },
  async (event) => {
    const uid = event.params.uid as string;
    const ticketId = event.params.ticketId as string;
    const data = event.data?.data();
    if (!data) return;
    if (data.transcriptionStatus === "pending") return;
    if (typeof data.description !== "string" || data.description.trim().length === 0) {
      return;
    }

    if (data.description.trim().toLowerCase() === "test") {
      await db
        .collection("users")
        .doc(uid)
        .collection("helpTickets")
        .doc(ticketId)
        .update({
          status: "closed",
          aiSummary:
            "This ticket was automatically closed because it was identified as a test.",
          updatedAt: FieldValue.serverTimestamp(),
        });
      return;
    }

    const apiKey = geminiApiKey.value();
    const model = geminiModel.value();
    await runHelpTicketTriage({
      uid,
      ticketId,
      data,
      apiKey,
      model,
    });
  }
);

export const triageHelpTicketAfterTranscription = onDocumentUpdated(
  {
    document: "users/{uid}/helpTickets/{ticketId}",
    region: REGION,
    secrets: [geminiApiKey],
    timeoutSeconds: 30,
    memory: "512MiB",
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;
    if (before.transcriptionStatus === after.transcriptionStatus) return;
    if (after.transcriptionStatus !== "completed") return;
    if (typeof after.description !== "string" || after.description.trim().length === 0) {
      return;
    }
    if (after.aiSummary) {
      return;
    }
    const uid = event.params.uid as string;
    const ticketId = event.params.ticketId as string;

    if (after.description.trim().toLowerCase() === "test") {
      await db
        .collection("users")
        .doc(uid)
        .collection("helpTickets")
        .doc(ticketId)
        .update({
          status: "closed",
          aiSummary:
            "This ticket was automatically closed because it was identified as a test.",
          updatedAt: FieldValue.serverTimestamp(),
        });
      return;
    }

    const apiKey = geminiApiKey.value();
    const model = geminiModel.value();
    await runHelpTicketTriage({
      uid,
      ticketId,
      data: after,
      apiKey,
      model,
    });
  }
);
