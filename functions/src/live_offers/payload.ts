import { HttpsError } from "firebase-functions/v2/https";
import { readOptionalCurrentLocation } from "../current_location";
import { normalizeOffer, normalizeString, toNumber } from "../offer_normalization";
import type { LiveOfferCaptureContext, LiveOfferProvider, OfferInput } from "../profitability_types";
import type { LiveOfferPayload } from "./types";

export type NormalizedLiveOfferPayload = {
  deviceId: string;
  vehicleId?: string;
  timezone?: string;
  currentLocation: { lat: number; lng: number } | null;
  offer: OfferInput;
  provider: LiveOfferProvider;
  liveOfferSessionId: string;
  captureContext: LiveOfferCaptureContext;
};

export function readLiveOfferPayload(data: unknown): NormalizedLiveOfferPayload {
  const payload = (data ?? {}) as LiveOfferPayload;
  const deviceId = normalizeRequiredString(payload.deviceId, "deviceId");
  const provider = normalizeProvider(payload.provider);
  const liveOfferSessionId = normalizeRequiredString(
    payload.liveOfferSessionId,
    "liveOfferSessionId"
  );
  const captureContext = normalizeCaptureContext(payload.captureContext);
  const offer = normalizeOffer(payload.offer);
  if (!offer) {
    throw new HttpsError("invalid-argument", "Missing live offer payload.");
  }
  return {
    deviceId,
    vehicleId: normalizeString(payload.vehicleId) ?? undefined,
    timezone: normalizeString(payload.timezone) ?? undefined,
    currentLocation: readOptionalCurrentLocation({
      currentLocation: payload.currentLocation,
    }),
    offer,
    provider,
    liveOfferSessionId,
    captureContext,
  };
}

function normalizeRequiredString(value: unknown, field: string): string {
  const normalized = normalizeString(value);
  if (!normalized) {
    throw new HttpsError("invalid-argument", `Missing ${field}.`);
  }
  return normalized;
}

function normalizeProvider(value: unknown): LiveOfferProvider {
  if (value === "uber_eats" || value === "deliveroo") {
    return value;
  }
  throw new HttpsError("invalid-argument", "Unsupported live offer provider.");
}

function normalizeCaptureContext(value: unknown): LiveOfferCaptureContext {
  const source = (value ?? {}) as Partial<LiveOfferCaptureContext>;
  return {
    parserVersion: normalizeRequiredString(source.parserVersion, "captureContext.parserVersion"),
    packageName: normalizeRequiredString(source.packageName, "captureContext.packageName"),
    screenVariant: normalizeString(source.screenVariant),
    confidence: toNumber(source.confidence),
    locationAgeMs: toNumber(source.locationAgeMs),
  };
}
