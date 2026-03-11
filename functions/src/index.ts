import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineString } from "firebase-functions/params";
import { loadAdemeRecords } from "./ademe_dataset";
import { selectConsumption } from "./ademe_consumption";
import { findAdemeMatch, LookupEnergy } from "./ademe_matcher";
export { lookupVehicleByPlate } from "./vehicle_plate_lookup";
import { requestGeminiOffer } from "./gemini_client";
import { parseGeminiJson } from "./gemini_json";
import { postprocessOfferExtraction } from "./offer_postprocess";
export { verifyOfferRoute } from "./verify_offer_route";
export { analyzeOffer } from "./analyze_offer";
export { scoreLiveOffer, commitLiveOfferVerdict } from "./live_offers";
export { parseBulkOffersScreenshot, commitBulkOffersImport } from "./bulk_offers";
export { syncOfferDailyStats } from "./offer_stats";
export { backfillOfferStats } from "./offer_stats_backfill";
export { registerDevice, revokeDevice } from "./device_registry";
export { triageHelpTicket } from "./help_ticket_triage";
export { triageHelpTicketAfterTranscription } from "./help_ticket_triage";
export { transcribeHelpTicketAudio } from "./help_ticket_transcription";
export { transcribeHelpDraftAudio } from "./help_ticket_draft_transcription";
export { notifyHelpTicketStatus } from "./help_ticket_notifications";
export { createHelpTicketCodexIssue } from "./help_ticket_codex_issue";
export { codexHelpTicketCallback } from "./help_ticket_codex_webhook";
export { seedHelpTicketTimeline } from "./help_ticket_timeline_seed";
export {
  createCheckoutSession,
  createCustomerPortalSession,
  stripeWebhook,
} from "./billing";
export {
  checkSubscriptionEligibility,
  getManagedSubscriptionState,
  changeSubscriptionPlan,
  setSubscriptionCancellation,
} from "./billing_manage";
export {
  adminGetOverview,
  adminListUsers,
  adminGetUserSnapshot,
  adminListOffers,
  adminListHelpTickets,
  adminGetHelpTicketDetail,
} from "./admin";

const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-3-flash-preview",
});

export const extractOfferFromImage = onCall(
  {
    cors: true,
    secrets: [],
    timeoutSeconds: 30,
    memory: "512MiB",
    region: "europe-west1",
  },
  async (request) => {
    const payload = request.data as {
      imageBase64?: string;
      mimeType?: string;
      debug?: boolean;
    };
    const debugRequested = payload?.debug === true;

    if (!payload?.imageBase64 || !payload?.mimeType) {
      throw new HttpsError("invalid-argument", "Missing image payload.");
    }

    const model = geminiModel.value();
    const debugEnabled = isDebugEnabled();
    const debugEnv = process.env.GEMINI_DEBUG ?? "undefined";
    logger.info("Gemini debug mode", {
      debugEnabled,
      debugEnv,
      model,
      mimeType: payload.mimeType,
    });
    console.error(
      "Gemini debug mode",
      JSON.stringify({
        debugEnabled,
        debugEnv,
        model,
        mimeType: payload.mimeType,
      })
    );
    const debugAllowed = debugRequested && debugEnabled;
    let text = await requestGeminiOffer({
      model,
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
    });
    if (debugEnabled) {
      logGeminiText({
        text,
        model,
        mimeType: payload.mimeType,
        attempt: 1,
      });
    }

    let parsed: any;
    try {
      parsed = parseGeminiJson(text);
    } catch (error) {
      const firstDiagnostics = buildGeminiDiagnostics(text);
      const shouldRetry =
        firstDiagnostics.startsWithBrace && firstDiagnostics.lastBraceIndex < 0;
      let finalError: unknown = error;
      let finalText = text;
      if (shouldRetry) {
        logger.warn("Gemini JSON incomplete, retrying", {
          model,
          mimeType: payload.mimeType,
          textLength: firstDiagnostics.textLength,
        });
        let retryText = "";
        try {
          retryText = await requestGeminiOffer({
            model,
            imageBase64: payload.imageBase64,
            mimeType: payload.mimeType,
          });
          if (debugEnabled) {
            logGeminiText({
              text: retryText,
              model,
              mimeType: payload.mimeType,
              attempt: 2,
            });
          }
          parsed = parseGeminiJson(retryText);
          const response = postprocessOfferExtraction(parsed);
          if (debugAllowed) {
            return {
              ...response,
              debug: {
                geminiText: retryText,
              },
            };
          }
          return response;
        } catch (retryError) {
          finalError = retryError;
          if (retryText) {
            finalText = retryText;
          }
        }
      }

      const diagnostics: Record<string, unknown> = {
        ...buildGeminiDiagnostics(finalText),
        model,
        mimeType: payload.mimeType,
        retryAttempted: shouldRetry,
      };
      if (debugAllowed) {
        diagnostics.rawGeminiText = finalText;
      }
      logger.error("Gemini JSON parse failed", diagnostics);
      console.error("Gemini JSON parse failed", JSON.stringify(diagnostics));
      if (debugAllowed) {
        const code = finalError instanceof HttpsError ? finalError.code : "internal";
        const message =
          finalError instanceof HttpsError
            ? finalError.message
            : "Gemini JSON parse failed.";
        throw new HttpsError(code, message, { rawGeminiText: finalText });
      }
      throw finalError;
    }
    const response = postprocessOfferExtraction(parsed);
    if (debugAllowed) {
      return {
        ...response,
        debug: {
          geminiText: text,
        },
      };
    }
    return response;
  }
);

export const lookupVehicleModel = onCall(
  {
    cors: true,
    timeoutSeconds: 20,
    memory: "256MiB",
    region: "europe-west1",
  },
  async (request) => {
    const payload = request.data as {
      brand?: string;
      model?: string;
      energyType?: string;
    };
    const brand = payload?.brand?.trim();
    const model = payload?.model?.trim();
    const energy = parseEnergy(payload?.energyType);
    if (!brand || !model || !energy) {
      throw new HttpsError("invalid-argument", "Missing lookup payload.");
    }
    const records = await loadAdemeRecords();
    const match = findAdemeMatch(records, brand, model, energy);
    if (!match) {
      return { match: false };
    }
    const consumption = selectConsumption(match, energy);
    if (consumption == null) {
      return { match: false };
    }
    return { match: true, consumptionPer100Km: consumption };
  }
);


function parseEnergy(value?: string): LookupEnergy | null {
  if (value == "electric") return "electric";
  if (value == "fuel") return "fuel";
  return null;
}

function buildGeminiDiagnostics(text: string) {
  const trimmed = text.trim();
  return {
    textLength: text.length,
    trimmedLength: trimmed.length,
    containsFence: text.includes("```"),
    startsWithBrace: trimmed.startsWith("{"),
    firstBraceIndex: text.indexOf("{"),
    lastBraceIndex: text.lastIndexOf("}"),
  };
}

function isDebugEnabled() {
  if (process.env.FUNCTIONS_EMULATOR === "true") {
    return true;
  }
  return process.env.GEMINI_DEBUG?.toLowerCase() == "true";
}


function logGeminiText(params: {
  text: string;
  model: string;
  mimeType: string;
  attempt: number;
}) {
  const maxChunk = 2000;
  const totalLength = params.text.length;
  const chunks = Math.ceil(totalLength / maxChunk);
  const maxLoggedChunks = 5;
  const toLog = Math.min(chunks, maxLoggedChunks);
  for (let i = 0; i < toLog; i += 1) {
    const start = i * maxChunk;
    const end = Math.min(start + maxChunk, totalLength);
    const slice = params.text.slice(start, end);
    const logPayload = {
      model: params.model,
      mimeType: params.mimeType,
      attempt: params.attempt,
      chunkIndex: i + 1,
      chunkTotal: chunks,
      geminiTextLength: totalLength,
      geminiTextChunk: slice,
    };
    logger.info("Gemini raw response chunk", logPayload);
    console.error("Gemini raw response chunk", JSON.stringify(logPayload));
  }
  if (chunks > maxLoggedChunks) {
    logger.warn("Gemini raw response truncated", {
      model: params.model,
      mimeType: params.mimeType,
      attempt: params.attempt,
      geminiTextLength: totalLength,
      loggedChunks: maxLoggedChunks,
    });
  }
}
