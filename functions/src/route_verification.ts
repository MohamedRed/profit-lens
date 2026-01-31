import { HttpsError } from "firebase-functions/v2/https";
import { geocodeAddress } from "./geocoding_api";
import {
  computeRoute,
  RouteLocationInput,
  RouteTravelMode,
} from "./routes_api";

export type RouteVerificationResult = {
  distanceKm: number;
  durationMinutes: number;
  provider: string;
  travelMode: RouteTravelMode;
  verifiedAt: string;
};

type VerifyRouteParams = {
  routesApiKey: string;
  geocodingApiKey?: string;
  origin: RouteLocationInput;
  destination: RouteLocationInput;
  travelMode: RouteTravelMode;
};

export async function verifyRoute(
  params: VerifyRouteParams
): Promise<RouteVerificationResult> {
  const resolvedOrigin = await resolveLocation(
    params.origin,
    params.geocodingApiKey
  );
  const resolvedDestination = await resolveLocation(
    params.destination,
    params.geocodingApiKey
  );
  const route = await computeRoute({
    apiKey: params.routesApiKey,
    origin: resolvedOrigin,
    destination: resolvedDestination,
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
  geocodingKey?: string
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
