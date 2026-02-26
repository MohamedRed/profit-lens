import { HttpsError } from "firebase-functions/v2/https";
import { geocodeAddress } from "./geocoding_api";
import { computeRoute, RouteLocationInput, RouteTravelMode } from "./routes_api";
import { GeoPoint, RouteVerification } from "./profitability_types";

type VerifyRouteParams = {
  apiKey: string;
  geocodingKey: string;
  origin: RouteLocationInput;
  destination: RouteLocationInput;
  travelMode: RouteTravelMode;
};

type VerifyRouteLegsParams = {
  apiKey: string;
  geocodingKey: string;
  currentLocation: GeoPoint;
  pickup: RouteLocationInput;
  dropoff: RouteLocationInput;
  travelMode: RouteTravelMode;
};

type RouteLegMetrics = {
  distanceKm: number;
  durationMinutes: number;
};

export async function verifyRoute(
  params: VerifyRouteParams
): Promise<RouteVerification> {
  const [origin, destination] = await Promise.all([
    resolveLocation(params.origin, params.geocodingKey),
    resolveLocation(params.destination, params.geocodingKey),
  ]);
  const route = await computeRoute({
    apiKey: params.apiKey,
    origin,
    destination,
    travelMode: params.travelMode,
  });
  const metrics = toRouteLegMetrics(route);
  return {
    distanceKm: metrics.distanceKm,
    durationMinutes: metrics.durationMinutes,
    provider: "google_routes",
    travelMode: params.travelMode,
    verifiedAt: new Date().toISOString(),
  };
}

export async function verifyRouteLegs(
  params: VerifyRouteLegsParams
): Promise<{ approach: RouteLegMetrics; delivery: RouteLegMetrics }> {
  const [pickup, dropoff] = await Promise.all([
    resolveLocation(params.pickup, params.geocodingKey),
    resolveLocation(params.dropoff, params.geocodingKey),
  ]);
  const currentLocation: RouteLocationInput = { latLng: params.currentLocation };

  const [approachRoute, deliveryRoute] = await Promise.all([
    computeRoute({
      apiKey: params.apiKey,
      origin: currentLocation,
      destination: pickup,
      travelMode: params.travelMode,
    }),
    computeRoute({
      apiKey: params.apiKey,
      origin: pickup,
      destination: dropoff,
      travelMode: params.travelMode,
    }),
  ]);

  return {
    approach: toRouteLegMetrics(approachRoute),
    delivery: toRouteLegMetrics(deliveryRoute),
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

function toRouteLegMetrics(route: {
  distanceMeters: number;
  durationSeconds: number;
}): RouteLegMetrics {
  return {
    distanceKm: route.distanceMeters / 1000,
    durationMinutes: route.durationSeconds / 60,
  };
}
