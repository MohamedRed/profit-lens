import { HttpsError } from "firebase-functions/v2/https";
import { geocodeAddress } from "./geocoding_api";
import { computeRoute, RouteLocationInput, RouteTravelMode } from "./routes_api";
import { RouteVerification } from "./profitability_types";

type VerifyRouteParams = {
  apiKey: string;
  geocodingKey: string;
  origin: RouteLocationInput;
  destination: RouteLocationInput;
  travelMode: RouteTravelMode;
};

export async function verifyRoute(
  params: VerifyRouteParams
): Promise<RouteVerification> {
  const origin = await resolveLocation(params.origin, params.geocodingKey);
  const destination = await resolveLocation(
    params.destination,
    params.geocodingKey
  );
  const route = await computeRoute({
    apiKey: params.apiKey,
    origin,
    destination,
    travelMode: params.travelMode,
  });
  return {
    distanceKm: route.distanceMeters / 1000,
    durationMinutes: route.durationSeconds / 60,
    provider: "google_routes",
    travelMode: params.travelMode,
    verifiedAt: new Date().toISOString(),
  };
}

async function resolveLocation(
  input: RouteLocationInput,
  geocodingKey: string
): Promise<RouteLocationInput> {
  if (input.placeId || input.latLng) {
    return input;
  }
  const address = input.address?.trim();
  if (!address) {
    throw new HttpsError("invalid-argument", "Missing route location.");
  }
  if (!geocodingKey) {
    throw new HttpsError(
      "failed-precondition",
      "GEOCODING_API_KEY is not set."
    );
  }
  const coords = await geocodeAddress({ apiKey: geocodingKey, address });
  return { latLng: coords };
}
