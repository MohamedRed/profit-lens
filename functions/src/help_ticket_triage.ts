import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import { defineSecret, defineString } from "firebase-functions/params";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase_admin";
import { requestGeminiJson } from "./gemini_client";
import { parseGeminiJson } from "./gemini_json";
import { helpTriagePrompt } from "./help_triage_prompt";

const REGION = "europe-west1";
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const geminiModel = defineString("GEMINI_TRIAGE_MODEL", {
  default: "gemini-3-flash-preview",
});

const helpTriageSchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: ["in_progress", "awaiting_response"],
    },
    statusMessage: { type: "string" },
    summary: { type: "string" },
    nextSteps: { type: "string" },
    needsUserAction: { type: "boolean" },
    confidence: { type: "number" },
  },
  required: [
    "status",
    "statusMessage",
    "summary",
    "nextSteps",
    "needsUserAction",
    "confidence",
  ],
  additionalProperties: false,
} as const;

type HelpTriageResult = {
  status: "in_progress" | "awaiting_response";
  statusMessage: string;
  summary: string;
  nextSteps: string;
  needsUserAction: boolean;
  confidence: number;
};

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

    const ticketRef = db
      .collection("users")
      .doc(uid)
      .collection("helpTickets")
      .doc(ticketId);

    await ticketRef.set(
      {
        status: "triaging",
        statusMessage: "AI triage in progress",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not set.");
    }

    const prompt = [
      helpTriagePrompt,
      "",
      "Ticket:",
      `Title: ${data.title ?? ""}`,
      `Description: ${data.description ?? ""}`,
      `Platform: ${data.platform ?? ""}`,
      `Locale: ${data.locale ?? ""}`,
      `ImageCount: ${data.imageCount ?? 0}`,
      `AudioCount: ${data.audioCount ?? 0}`,
    ].join("\n");

    const model = geminiModel.value();
    logger.info("Help ticket triage", { uid, ticketId, model });

    const text = await requestGeminiJson({
      apiKey,
      model,
      prompt,
      schema: helpTriageSchema,
      temperature: 0.2,
      maxOutputTokens: 1024,
    });

    const parsed = parseGeminiJson(text) as HelpTriageResult;

    await ticketRef.set(
      {
        status: parsed.status,
        statusMessage: parsed.statusMessage,
        aiSummary: parsed.summary,
        aiNextSteps: parsed.nextSteps,
        aiConfidence: parsed.confidence,
        aiNeedsUserAction: parsed.needsUserAction,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }
);
