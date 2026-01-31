import { HttpsError } from "firebase-functions/v2/https";

type LatLngInput = {
  lat: number;
  lng: number;
};

export type RouteLocationInput = {
  placeId?: string;
  latLng?: LatLngInput;
  address?: string;
};

export type RouteTravelMode = "DRIVE" | "BICYCLE" | "TWO_WHEELER" | "WALK";

type ComputeRouteRequest = {
  apiKey: string;
  origin: RouteLocationInput;
  destination: RouteLocationInput;
  travelMode: RouteTravelMode;
};

type ComputeRouteResponse = {
  distanceMeters: number;
  durationSeconds: number;
};

const ROUTES_API_URL =
  "https://routes.googleapis.com/directions/v2:computeRoutes";

export async function computeRoute(
  request: ComputeRouteRequest
): Promise<ComputeRouteResponse> {
  const body = {
    origin: buildWaypoint(request.origin),
    destination: buildWaypoint(request.destination),
    travelMode: request.travelMode,
    routingPreference:
      request.travelMode === "DRIVE" || request.travelMode === "TWO_WHEELER"
        ? "TRAFFIC_AWARE"
        : undefined,
  };

  const response = await fetch(ROUTES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": request.apiKey,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new HttpsError(
      "internal",
      `Routes API error (${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as {
    routes?: Array<{ distanceMeters?: number; duration?: string }>;
  };
  const route = data.routes?.[0];
  const distanceMeters = route?.distanceMeters;
  const durationSeconds = parseDurationSeconds(route?.duration);
  if (!distanceMeters || durationSeconds == null) {
    throw new HttpsError("internal", "Routes API returned no route.");
  }
  return { distanceMeters, durationSeconds };
}

function buildWaypoint(input: RouteLocationInput) {
  if (input.placeId) {
    return { placeId: input.placeId };
  }
  if (input.latLng) {
    return {
      location: {
        latLng: {
          latitude: input.latLng.lat,
          longitude: input.latLng.lng,
        },
      },
    };
  }
  throw new HttpsError("invalid-argument", "Missing route location.");
}

function parseDurationSeconds(value?: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.endsWith("s")) {
    return null;
  }
  const seconds = Number.parseFloat(trimmed.slice(0, -1));
  if (Number.isNaN(seconds)) {
    return null;
  }
  return seconds;
}
