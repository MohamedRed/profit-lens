import { offerExtractionPrompt } from "./gemini_prompt";
import { parseExtractionJson, shouldRetryExtractionJson } from "./offer_extraction_core/json_parse";
import { requestExtractionJson } from "./offer_extraction_core/gemini_request";
import { postprocessOfferExtraction } from "./offer_postprocess";
import { OfferInput } from "./profitability_types";
import { normalizeExtraction, normalizeOffer } from "./offer_normalization";

type ExtractedOffer = {
  offer: OfferInput | null;
  extraction: { confidence: number; rawText: string | null } | null;
};

const offerExtractionSchema = {
  type: "object",
  properties: {
    offer: {
      type: "object",
      properties: {
        payoutEuro: { type: ["number", "null"] },
        distanceKm: { type: ["number", "null"] },
        pickupName: { type: ["string", "null"] },
        pickupAddress: { type: ["string", "null"] },
        dropoffName: { type: ["string", "null"] },
        dropoffAddress: { type: ["string", "null"] },
      },
      required: [
        "payoutEuro",
        "distanceKm",
        "pickupName",
        "pickupAddress",
        "dropoffName",
        "dropoffAddress",
      ],
      additionalProperties: false,
    },
    confidence: { type: ["number", "null"] },
    rawText: { type: "string" },
  },
  required: ["offer", "confidence", "rawText"],
  additionalProperties: false,
} as const;

export async function extractOfferFromImagePayload(params: {
  model: string;
  imageBase64: string;
  mimeType: string;
}): Promise<ExtractedOffer> {
  const text = await requestExtractionJson({
    model: params.model,
    prompt: offerExtractionPrompt,
    schema: offerExtractionSchema as unknown as Record<string, unknown>,
    imageBase64: params.imageBase64,
    mimeType: params.mimeType,
  });
  let parsed: any;
  try {
    parsed = parseExtractionJson(text);
  } catch (error) {
    const retry = shouldRetryExtractionJson(text);
    if (!retry) {
      throw error;
    }
    const retryText = await requestExtractionJson({
      model: params.model,
      prompt: offerExtractionPrompt,
      schema: offerExtractionSchema as unknown as Record<string, unknown>,
      imageBase64: params.imageBase64,
      mimeType: params.mimeType,
    });
    parsed = parseExtractionJson(retryText);
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
