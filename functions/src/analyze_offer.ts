import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret, defineString } from "firebase-functions/params";
import { loadUserProfile, loadVehicleSnapshot } from "./profile_vehicle_loader";
import { evaluateProfitability } from "./profitability_engine";
import { buildOfferRecordPayload } from "./offer_record_mapper";
import { OfferExtraction, OfferInput } from "./profitability_types";
import { db } from "./firebase_admin";
import { requestGeminiOffer } from "./gemini_client";
import { parseGeminiJson } from "./gemini_json";
import { postprocessOfferExtraction } from "./offer_postprocess";
import { verifyRoute } from "./route_verification";
import { RouteLocationInput, RouteTravelMode } from "./routes_api";

type AnalyzeOfferPayload = {
  offer?: OfferInput;
  vehicleId?: string;
  source?: string;
  extraction?: { confidence?: number; rawText?: string | null };
  imageBase64?: string;
  mimeType?: string;
};

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const routesApiKey = defineSecret("ROUTES_API_KEY");
const geocodingApiKey = defineSecret("GEOCODING_API_KEY");
const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-3-flash-preview",
});

export const analyzeOffer = onCall(
  {
    cors: true,
    secrets: [geminiApiKey, routesApiKey, geocodingApiKey],
    timeoutSeconds: 20,
    memory: "256MiB",
    region: "europe-west1",
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const payload = request.data as AnalyzeOfferPayload;
    const resolved = await resolveOfferInput(payload);
    if (!resolved) {
      throw new HttpsError("invalid-argument", "Missing offer payload.");
    }
    const { offer, extraction } = resolved;

    const { costSettings, defaultVehicleId } = await loadUserProfile(uid);
    const vehicleId = payload.vehicleId ?? defaultVehicleId;
    if (!vehicleId) {
      throw new HttpsError(
        "failed-precondition",
        "Vehicle is required for analysis."
      );
    }
    const vehicle = await loadVehicleSnapshot(uid, vehicleId);

    const routeVerification = await buildRouteVerification({
      offer,
      vehicleType: vehicle.type,
    });
    offer.routeVerification = routeVerification;
    if (!offer.distanceKm || offer.distanceKm <= 0) {
      offer.distanceKm = routeVerification.distanceKm;
    }
    if (!offer.durationMinutes || offer.durationMinutes <= 0) {
      offer.durationMinutes = routeVerification.durationMinutes;
    }
    if (!offer.distanceKm || offer.distanceKm <= 0) {
      throw new HttpsError(
        "failed-precondition",
        "Distance is required for analysis."
      );
    }

    let breakdown;
    try {
      breakdown = evaluateProfitability({
        offer,
        vehicle,
        costs: costSettings,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to compute profitability.";
      throw new HttpsError("failed-precondition", message);
    }

    const source = resolveSource(payload);
    const createdAt = new Date();
    const docRef = db
      .collection("users")
      .doc(uid)
      .collection("offers")
      .doc();

    const { record, document } = buildOfferRecordPayload({
      id: docRef.id,
      offer,
      source,
      createdAt,
      vehicleSnapshot: vehicle,
      costSnapshot: costSettings,
      breakdown,
      extraction,
    });

    await docRef.set(document, { merge: true });
    logger.info("Offer analysis saved", {
      uid,
      offerId: docRef.id,
      source,
      runtime: process.version,
    });

    return { record };
  }
);

type OfferResolution = {
  offer: OfferInput;
  extraction?: OfferExtraction | null;
};

async function resolveOfferInput(
  payload: AnalyzeOfferPayload
): Promise<OfferResolution | null> {
  const baseOffer = normalizeOffer(payload.offer);
  if (payload.imageBase64 && payload.mimeType) {
    const extracted = await extractOfferFromImagePayload(payload);
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

function resolveSource(payload: AnalyzeOfferPayload): string {
  if (payload.imageBase64 && payload.mimeType) {
    return "screenshot";
  }
  return payload.source ?? "manual";
}

function normalizeOffer(input?: OfferInput): OfferInput | null {
  if (!input) {
    return null;
  }
  const payout = toNumber(input.payoutEuro);
  const distance = toNumber(input.distanceKm);
  if (payout == null) {
    return null;
  }
  return {
    payoutEuro: payout,
    distanceKm: distance ?? null,
    durationMinutes: toNumber(input.durationMinutes),
    pickupName: normalizeString(input.pickupName),
    pickupAddress: normalizeString(input.pickupAddress),
    dropoffName: normalizeString(input.dropoffName),
    dropoffAddress: normalizeString(input.dropoffAddress),
    routeVerification: input.routeVerification ?? undefined,
  };
}

function normalizeExtraction(input?: {
  confidence?: number;
  rawText?: string | null;
}) {
  if (!input) return null;
  const confidence = toNumber(input.confidence);
  if (confidence == null) return null;
  return {
    confidence,
    rawText: normalizeString(input.rawText),
  };
}

function normalizeString(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length == 0 ? null : trimmed;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

async function extractOfferFromImagePayload(payload: AnalyzeOfferPayload) {
  const apiKey = geminiApiKey.value();
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "GEMINI_API_KEY is not set.");
  }
  const model = geminiModel.value();
  const text = await requestGeminiOffer({
    apiKey,
    model,
    imageBase64: payload.imageBase64!,
    mimeType: payload.mimeType!,
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
      model,
      imageBase64: payload.imageBase64!,
      mimeType: payload.mimeType!,
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

function mergeOfferInputs(
  baseOffer: OfferInput,
  override?: OfferInput | null
): OfferInput {
  if (!override) {
    return baseOffer;
  }
  return {
    payoutEuro: override.payoutEuro ?? baseOffer.payoutEuro,
    distanceKm: override.distanceKm ?? baseOffer.distanceKm,
    durationMinutes: override.durationMinutes ?? baseOffer.durationMinutes,
    pickupName: override.pickupName ?? baseOffer.pickupName,
    pickupAddress: override.pickupAddress ?? baseOffer.pickupAddress,
    dropoffName: override.dropoffName ?? baseOffer.dropoffName,
    dropoffAddress: override.dropoffAddress ?? baseOffer.dropoffAddress,
    routeVerification: override.routeVerification ?? baseOffer.routeVerification,
  };
}

function shouldRetryGemini(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) {
    return false;
  }
  return text.lastIndexOf("}") < 0;
}

async function buildRouteVerification(params: {
  offer: OfferInput;
  vehicleType: string;
}) {
  const routesKey = routesApiKey.value();
  if (!routesKey) {
    throw new HttpsError("failed-precondition", "ROUTES_API_KEY is not set.");
  }
  const geocodingKey = geocodingApiKey.value();
  if (!geocodingKey) {
    throw new HttpsError(
      "failed-precondition",
      "GEOCODING_API_KEY is not set."
    );
  }
  const origin = buildLocationInput(
    params.offer.pickupAddress ?? params.offer.pickupName
  );
  const destination = buildLocationInput(
    params.offer.dropoffAddress ?? params.offer.dropoffName
  );
  if (!origin || !destination) {
    throw new HttpsError(
      "failed-precondition",
      "Pickup and dropoff are required for route verification."
    );
  }
  const travelMode = mapTravelMode(params.vehicleType);
  return verifyRoute({
    apiKey: routesKey,
    geocodingKey,
    origin,
    destination,
    travelMode,
  });
}

function buildLocationInput(value?: string | null): RouteLocationInput | null {
  const address = normalizeString(value);
  if (!address) {
    return null;
  }
  return { address };
}

function mapTravelMode(vehicleType: string): RouteTravelMode {
  switch (vehicleType) {
    case "bike":
    case "ebike":
      return "BICYCLE";
    case "scooter":
      return "TWO_WHEELER";
    case "car":
      return "DRIVE";
    default:
      throw new HttpsError(
        "failed-precondition",
        "Vehicle type is not supported for routing."
      );
  }
}
