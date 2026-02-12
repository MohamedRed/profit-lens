import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { db } from "./firebase_admin";
import { resolveDelivererStatus } from "./help_ticket_deliverer_status";

const REGION = "europe-west1";
const codexWebhookSecret = defineSecret("CODEX_HELP_TICKET_WEBHOOK_SECRET");

type CodexWebhookPayload = {
  ticketId?: string;
  uid?: string;
  status?: string;
  prUrl?: string;
  prNumber?: number;
  branch?: string;
  message?: string;
};

export const codexHelpTicketCallback = onRequest(
  {
    region: REGION,
    secrets: [codexWebhookSecret],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const secret = codexWebhookSecret.value();
    if (!secret) {
      res.status(500).send("Missing webhook secret");
      return;
    }

    const authHeader = req.get("authorization") ?? "";
    const expected = `Bearer ${secret}`;
    if (!safeEqual(authHeader, expected)) {
      res.status(401).send("Unauthorized");
      return;
    }

    const payload = parsePayload(req.body);
    if (!payload.ticketId || !payload.uid || !payload.status) {
      res.status(400).send("Missing payload fields");
      return;
    }

    const status = normalizeStatus(payload.status);
    if (!status) {
      res.status(400).send("Invalid status");
      return;
    }

    const ticketRef = db
      .collection("users")
      .doc(payload.uid)
      .collection("helpTickets")
      .doc(payload.ticketId);
    const snap = await ticketRef.get();
    const ticketData = snap.data();
    if (!ticketData) {
      res.status(404).send("Ticket not found");
      return;
    }

    const message =
      payload.message ??
      resolveStatusMessage(ticketData.locale as string | undefined, status);

    const updates: Record<string, unknown> = {
      codingAgentStatus: status,
      codingAgentUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      statusMessage: message,
      ...buildDelivererStatusUpdates({
        status: ticketData.status as string | undefined,
        codingAgentStatus: status,
        aiNeedsUserAction: ticketData.aiNeedsUserAction as boolean | undefined,
        locale: ticketData.locale as string | undefined,
      }),
    };
    if (payload.prUrl) updates.codingAgentPrUrl = payload.prUrl;
    if (payload.prNumber) updates.codingAgentPrNumber = payload.prNumber;
    if (payload.branch) updates.codingAgentBranch = payload.branch;

    await ticketRef.set(updates, { merge: true });
    logger.info("AI agent webhook updated ticket", {
      ticketId: payload.ticketId,
      status,
    });

    res.status(200).send("ok");
  }
);

function parsePayload(body: unknown): CodexWebhookPayload {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as CodexWebhookPayload;
    } catch {
      return {};
    }
  }
  if (typeof body === "object") {
    return body as CodexWebhookPayload;
  }
  return {};
}

function normalizeStatus(status: string) {
  const normalized = status.toLowerCase();
  const allowed = new Set([
    "queued",
    "running",
    "pr_created",
    "no_changes",
    "failed",
  ]);
  return allowed.has(normalized) ? normalized : null;
}

function resolveStatusMessage(locale: string | undefined, status: string) {
  const normalized = (locale ?? "").toLowerCase();
  const isFr = normalized.startsWith("fr");
  const isAr = normalized.startsWith("ar");
  switch (status) {
    case "queued":
      if (isFr) return "Agent IA en file d’attente.";
      if (isAr) return "تمت جدولة وكيل الذكاء الاصطناعي.";
      return "AI agent queued.";
    case "running":
      if (isFr) return "Agent IA en cours d’exécution.";
      if (isAr) return "يعمل وكيل الذكاء الاصطناعي الآن.";
      return "AI agent is running.";
    case "pr_created":
      if (isFr) return "Correctif proposé prêt pour examen.";
      if (isAr) return "اقتراح الإصلاح جاهز للمراجعة.";
      return "Proposed fix is ready for review.";
    case "no_changes":
      if (isFr) return "Aucun correctif applicable trouvé par l’agent IA.";
      if (isAr) return "لم يجد وكيل الذكاء الاصطناعي تغييرات قابلة للتطبيق.";
      return "AI agent did not find applicable changes.";
    case "failed":
      if (isFr) return "Échec de la préparation du correctif IA.";
      if (isAr) return "فشل وكيل الذكاء الاصطناعي في إعداد الإصلاح.";
      return "AI agent failed to prepare a fix.";
    default:
      return "AI agent update received.";
  }
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  try {
    const crypto = require("crypto") as typeof import("crypto");
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

function buildDelivererStatusUpdates(input: {
  status?: string;
  codingAgentStatus?: string;
  aiNeedsUserAction?: boolean;
  locale?: string;
}) {
  const resolution = resolveDelivererStatus(input);
  if (resolution.warnings.length > 0) {
    logger.warn("Help ticket deliverer status warning", {
      ...input,
      warnings: resolution.warnings,
    });
  }
  logger.info("Help ticket deliverer status resolved", {
    ...input,
    delivererStatus: resolution.delivererStatus,
  });
  return {
    delivererStatus: resolution.delivererStatus,
    delivererStatusMessage: resolution.delivererStatusMessage,
    delivererStatusUpdatedAt: FieldValue.serverTimestamp(),
  };
}
