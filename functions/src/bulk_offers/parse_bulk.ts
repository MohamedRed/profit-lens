import { HttpsError, onCall } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import { assertDeviceActive } from "../device_registry";
import { parseExtractionJson, shouldRetryExtractionJson } from "../offer_extraction_core/json_parse";
import { requestExtractionJson } from "../offer_extraction_core/gemini_request";
import { normalizeExtractedOfferCandidate, normalizeString } from "../offer_extraction_core/normalization";
import { validateNormalizedOfferRow } from "../offer_extraction_core/validation";
import { ExtractedOfferCandidate } from "../offer_extraction_core/types";
import { parseDateOnly } from "../local_day";
import { bulkOfferExtractionPrompt, bulkOfferExtractionSchema } from "./prompt";
import { bulkCallableConfig, MAX_BULK_ROWS_PER_COMMIT } from "./constants";
import {
  BulkInvalidRow,
  BulkParsedRow,
  ParseBulkOffersScreenshotRequest,
  ParseBulkOffersScreenshotResponse,
} from "./types";
import { uploadBulkScreenshot } from "./screenshot_storage";

const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-3-flash-preview",
});

type BulkExtractionPayload = {
  providerHint?: string | null;
  rawText?: string | null;
  offers?: ExtractedOfferCandidate[];
};

export const parseBulkOffersScreenshot = onCall(bulkCallableConfig, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  const payload = request.data as ParseBulkOffersScreenshotRequest;
  const deviceId = payload.deviceId?.trim();
  if (!deviceId) {
    throw new HttpsError("invalid-argument", "Missing deviceId.");
  }
  await assertDeviceActive(uid, deviceId);

  const timezone = payload.timezone?.trim();
  if (!timezone) {
    throw new HttpsError("invalid-argument", "Missing timezone.");
  }
  if (!payload.serviceDateIso) {
    throw new HttpsError("invalid-argument", "Missing serviceDateIso.");
  }
  parseDateOnly(payload.serviceDateIso);

  if (!payload.imageBase64 || !payload.mimeType) {
    throw new HttpsError("invalid-argument", "Missing screenshot payload.");
  }

  const screenshotRef = await uploadBulkScreenshot({
    uid,
    imageBase64: payload.imageBase64,
    mimeType: payload.mimeType,
  });

  const text = await requestExtractionJson({
    model: geminiModel.value(),
    prompt: bulkOfferExtractionPrompt,
    schema: bulkOfferExtractionSchema as unknown as Record<string, unknown>,
    imageBase64: payload.imageBase64,
    mimeType: payload.mimeType,
    maxOutputTokens: 4096,
  });

  let extracted: BulkExtractionPayload;
  try {
    extracted = parseExtractionJson<BulkExtractionPayload>(text);
  } catch (error) {
    if (!shouldRetryExtractionJson(text)) {
      throw error;
    }
    const retryText = await requestExtractionJson({
      model: geminiModel.value(),
      prompt: bulkOfferExtractionPrompt,
      schema: bulkOfferExtractionSchema as unknown as Record<string, unknown>,
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType,
      maxOutputTokens: 4096,
    });
    extracted = parseExtractionJson<BulkExtractionPayload>(retryText);
  }

  const parsedRows: BulkParsedRow[] = [];
  const invalidRows: BulkInvalidRow[] = [];
  const rows = Array.isArray(extracted.offers)
    ? extracted.offers.slice(0, MAX_BULK_ROWS_PER_COMMIT)
    : [];
  rows.forEach((candidate, sourceIndex) => {
    const normalized = normalizeExtractedOfferCandidate(candidate);
    const issues = validateNormalizedOfferRow(normalized);
    if (issues.length > 0) {
      invalidRows.push({ sourceIndex, raw: candidate, issues });
      return;
    }
    parsedRows.push({
      sourceIndex,
      payoutEuro: normalized.payoutEuro!,
      distanceKm: normalized.distanceKm!,
      durationMinutes: normalized.durationMinutes!,
      deliveryTime: normalized.deliveryTime!,
      pickupName: normalized.pickupName,
      pickupAddress: normalized.pickupAddress,
      dropoffName: normalized.dropoffName,
      dropoffAddress: normalized.dropoffAddress,
      tipEuro: normalized.tipEuro,
      confidence: normalized.confidence,
    });
  });

  const confidenceValues = parsedRows
    .map((item) => item.confidence)
    .filter((item): item is number => typeof item === "number" && Number.isFinite(item));
  const confidenceAvg = confidenceValues.length > 0
    ? confidenceValues.reduce((total, current) => total + current, 0) / confidenceValues.length
    : null;

  const response: ParseBulkOffersScreenshotResponse = {
    screenshotRef,
    parsedRows,
    invalidRows,
    parseMeta: {
      providerHint: normalizeString(extracted.providerHint),
      confidenceAvg,
      rawTextStored: typeof extracted.rawText === "string" && extracted.rawText.trim().length > 0,
    },
  };
  return response;
});
