import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase_admin";
import { requestGeminiJson } from "./gemini_client";
import { parseGeminiJson } from "./gemini_json";
import { helpTriagePrompt } from "./help_triage_prompt";

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

export async function runHelpTicketTriage(params: {
  uid: string;
  ticketId: string;
  data: Record<string, unknown>;
  apiKey: string;
  model: string;
}) {
  const { uid, ticketId, data, apiKey, model } = params;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not set.");
  }

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

  const prompt = [
    helpTriagePrompt,
    "",
    "Ticket:",
    `Description: ${(data.description as string | undefined) ?? ""}`,
    `Platform: ${(data.platform as string | undefined) ?? ""}`,
    `Locale: ${(data.locale as string | undefined) ?? ""}`,
    `ImageCount: ${(data.imageCount as number | undefined) ?? 0}`,
    `AudioCount: ${(data.audioCount as number | undefined) ?? 0}`,
  ].join("\n");

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
