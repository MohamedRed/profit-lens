import * as logger from "firebase-functions/logger";
import { db } from "./firebase_admin";
import { requestGeminiJsonWithRetry } from "./gemini_json_retry";
import { helpTriagePrompt } from "./help_triage_prompt";
import { resolveHelpTicketTitle } from "./help_ticket_title";
import { applyDelivererStatusUpdate } from "./help_ticket_timeline";
import { logDelivererStatusResolution } from "./help_ticket_status_logger";

const helpTriageSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
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
    "title",
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
  title: string;
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
  model: string;
}) {
  const { uid, ticketId, data, model } = params;

  const ticketRef = db
    .collection("users")
    .doc(uid)
    .collection("helpTickets")
    .doc(ticketId);

  const triagingUpdate = await applyDelivererStatusUpdate({
    ticketRef,
    source: "triage",
    updates: {
      status: "triaging",
      statusMessage: resolveTriageStatusMessage(
        data.locale as string | undefined
      ),
    },
  });
  logDelivererStatusResolution({
    source: "triage",
    ticketId,
    ...triagingUpdate,
  });

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

  const parsed = await requestGeminiJsonWithRetry<HelpTriageResult>({
    model,
    prompt,
    schema: helpTriageSchema,
    temperature: 0.1,
    maxOutputTokens: 2048,
    context: { uid, ticketId, feature: "help_ticket_triage" },
  });

  const triageResultUpdate = await applyDelivererStatusUpdate({
    ticketRef,
    source: "triage",
    updates: {
      title: resolveHelpTicketTitle({
        title: parsed.title,
        summary: parsed.summary,
        locale: data.locale as string | undefined,
      }),
      status: parsed.status,
      statusMessage: parsed.statusMessage,
      aiSummary: parsed.summary,
      aiNextSteps: parsed.nextSteps,
      aiConfidence: parsed.confidence,
      aiNeedsUserAction: parsed.needsUserAction,
    },
  });
  logDelivererStatusResolution({
    source: "triage",
    ticketId,
    ...triageResultUpdate,
  });
}

function resolveTriageStatusMessage(locale?: string) {
  if (!locale) return "AI triage in progress";
  const normalized = locale.toLowerCase();
  if (normalized.startsWith("fr")) {
    return "Analyse IA en cours";
  }
  if (normalized.startsWith("ar")) {
    return "جارٍ تحليل البلاغ بالذكاء الاصطناعي";
  }
  return "AI triage in progress";
}
