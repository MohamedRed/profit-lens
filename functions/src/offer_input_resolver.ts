import { HttpsError } from "firebase-functions/v2/https";
import { AnalyzeOfferPayload } from "./offer_analysis_types";
import { extractOfferFromImagePayload } from "./offer_image_extraction";
import {
  mergeOfferInputs,
  normalizeExtraction,
  normalizeOffer,
} from "./offer_normalization";
import { OfferExtraction, OfferInput } from "./profitability_types";

type OfferResolution = {
  offer: OfferInput;
  extraction?: OfferExtraction | null;
};

export async function resolveOfferInput(
  payload: AnalyzeOfferPayload,
  gemini: { apiKey: string | null; model: string }
): Promise<OfferResolution | null> {
  const baseOffer = normalizeOffer(payload.offer);
  if (payload.imageBase64 && payload.mimeType) {
    const extracted = await extractOfferFromImagePayload({
      apiKey: gemini.apiKey,
      model: gemini.model,
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
    });
    if (!extracted.offer) {
      throw new HttpsError("internal", "Gemini extraction returned no offer.");
    }
    return {
      offer: mergeOfferInputs(extracted.offer, baseOffer),
      extraction: extracted.extraction ?? null,
    };
  }
  if (!baseOffer) {
    return null;
  }
  return {
    offer: baseOffer,
    extraction: normalizeExtraction(payload.extraction),
  };
}
