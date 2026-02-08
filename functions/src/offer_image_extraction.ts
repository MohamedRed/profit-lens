import { HttpsError } from "firebase-functions/v2/https";
import { requestGeminiOffer } from "./gemini_client";
import { parseGeminiJson } from "./gemini_json";
import { postprocessOfferExtraction } from "./offer_postprocess";
import { OfferInput } from "./profitability_types";
import { normalizeExtraction, normalizeOffer } from "./offer_normalization";

type ExtractedOffer = {
  offer: OfferInput | null;
  extraction: { confidence: number; rawText: string | null } | null;
};

export async function extractOfferFromImagePayload(params: {
  apiKey: string | null;
  model: string;
  imageBase64: string;
  mimeType: string;
}): Promise<ExtractedOffer> {
  const apiKey = params.apiKey;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not set.");
  }
  const text = await requestGeminiOffer({
    apiKey,
    model: params.model,
    imageBase64: params.imageBase64,
    mimeType: params.mimeType,
  });
  let parsed: any;
  try {
    parsed = parseGeminiJson(text);
  } catch (error) {
    const retry = shouldRetryGemini(text);
    if (!retry) {
      throw error;
    }
    const retryText = await requestGeminiOffer({
      apiKey,
      model: params.model,
      imageBase64: params.imageBase64,
      mimeType: params.mimeType,
    });
    parsed = parseGeminiJson(retryText);
  }
  const processed = postprocessOfferExtraction(parsed) as any;
  const offer = normalizeOffer(processed.offer);
  if (!offer) {
    return { offer: null, extraction: null };
  }
  const extraction = normalizeExtraction({
    confidence: processed.confidence,
    rawText: processed.rawText,
  });
  return {
    offer,
    extraction: extraction ?? null,
  };
}

function shouldRetryGemini(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) {
    return false;
  }
  return text.lastIndexOf("}") < 0;
}
