import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/logger";
import { defineSecret, defineString } from "firebase-functions/params";
import { loadAdemeRecords } from "./ademe_dataset";
import { selectConsumption } from "./ademe_consumption";
import { findAdemeMatch, LookupEnergy } from "./ademe_matcher";
import { requestGeminiOffer } from "./gemini_client";
import { parseGeminiJson } from "./gemini_json";
import { postprocessOfferExtraction } from "./offer_postprocess";

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-2.5-flash",
});

export const extractOfferFromImage = onCall(
  {
    cors: true,
    secrets: [geminiApiKey],
    timeoutSeconds: 30,
    memory: "512MiB",
    region: "europe-west1",
  },
  async (request) => {
    const payload = request.data as {
      imageBase64?: string;
      mimeType?: string;
    };

    if (!payload?.imageBase64 || !payload?.mimeType) {
      throw new HttpsError("invalid-argument", "Missing image payload.");
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not set.");
    }

    const model = geminiModel.value();
    const text = await requestGeminiOffer({
      apiKey,
      model,
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
    });

    try {
      const parsed = parseGeminiJson(text);
      return postprocessOfferExtraction(parsed);
    } catch (error) {
      logger.error("Gemini JSON parse failed", {
        ...buildGeminiDiagnostics(text),
        model,
        mimeType: payload.mimeType,
      });
      throw error;
    }
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
