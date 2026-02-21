import { HttpsError } from "firebase-functions/v2/https";
import { normalizeString } from "./offer_normalization";
import { verifyRouteLegs } from "./route_verification";
import { RouteLocationInput, RouteTravelMode } from "./routes_api";
import { GeoPoint, OfferInput } from "./profitability_types";

export async function buildRouteVerification(params: {
  offer: OfferInput;
  vehicleType: string;
  currentLocation: GeoPoint;
  routesApiKey: string | null;
  geocodingApiKey: string | null;
}) {
  const routesKey = params.routesApiKey;
  if (!routesKey) {
    throw new HttpsError("failed-precondition", "ROUTES_API_KEY is not set.");
  }
  const geocodingKey = params.geocodingApiKey;
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
  const legs = await verifyRouteLegs({
    apiKey: routesKey,
    geocodingKey,
    currentLocation: params.currentLocation,
    pickup: origin,
    dropoff: destination,
    travelMode,
  });

  return {
    distanceKm: legs.approach.distanceKm + legs.delivery.distanceKm,
    durationMinutes: legs.approach.durationMinutes + legs.delivery.durationMinutes,
    approachDistanceKm: legs.approach.distanceKm,
    approachDurationMinutes: legs.approach.durationMinutes,
    deliveryDistanceKm: legs.delivery.distanceKm,
    deliveryDurationMinutes: legs.delivery.durationMinutes,
    provider: "google_routes",
    travelMode,
    verifiedAt: new Date().toISOString(),
  };
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
