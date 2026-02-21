import { HttpsError } from "firebase-functions/v2/https";
import type { AnalyzeOfferPayload } from "./offer_analysis_types";
import type { GeoPoint } from "./profitability_types";

const hasFiniteNumber = (value: unknown): value is number => {
  return typeof value === "number" && Number.isFinite(value);
};

export function readRequiredCurrentLocation(payload: AnalyzeOfferPayload): GeoPoint {
  const location = payload.currentLocation;
  if (!location || typeof location !== "object") {
    throw new HttpsError(
      "failed-precondition",
      "Current location is required for analysis."
    );
  }

  const lat = (location as { lat?: unknown }).lat;
  const lng = (location as { lng?: unknown }).lng;
  if (!hasFiniteNumber(lat) || !hasFiniteNumber(lng)) {
    throw new HttpsError("invalid-argument", "Invalid current location.");
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new HttpsError("invalid-argument", "Invalid current location.");
  }

  return { lat, lng };
}
