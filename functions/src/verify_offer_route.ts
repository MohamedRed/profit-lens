import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { computeRoute, RouteLocationInput, RouteTravelMode } from "./routes_api";

const routesApiKey = defineSecret("ROUTES_API_KEY");

export const verifyOfferRoute = onCall(
  {
    cors: true,
    secrets: [routesApiKey],
    timeoutSeconds: 20,
    memory: "256MiB",
    region: "europe-west1",
  },
  async (request) => {
    const payload = request.data as {
      origin?: RouteLocationInput;
      destination?: RouteLocationInput;
      travelMode?: RouteTravelMode;
    };
    const origin = payload?.origin;
    const destination = payload?.destination;
    const travelMode = payload?.travelMode;
    if (!origin || !destination || !travelMode) {
      throw new HttpsError("invalid-argument", "Missing route payload.");
    }
    if (!isTravelMode(travelMode)) {
      throw new HttpsError("invalid-argument", "Unsupported travel mode.");
    }
    const apiKey = routesApiKey.value();
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "ROUTES_API_KEY is not set."
      );
    }
    const route = await computeRoute({
      apiKey,
      origin,
      destination,
      travelMode,
    });
    return {
      distanceKm: route.distanceMeters / 1000,
      durationMinutes: route.durationSeconds / 60,
      provider: "google_routes",
      travelMode,
      verifiedAt: new Date().toISOString(),
    };
  }
);

function isTravelMode(value: string): value is RouteTravelMode {
  return (
    value === "DRIVE" ||
    value === "BICYCLE" ||
    value === "TWO_WHEELER" ||
    value === "WALK"
  );
}
