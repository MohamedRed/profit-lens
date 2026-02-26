import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret, defineString } from "firebase-functions/params";
import { loadUserProfile, loadVehicleSnapshot } from "./profile_vehicle_loader";
import { evaluateProfitability } from "./profitability_engine";
import { buildOfferRecordPayload } from "./offer_record_mapper";
import { db } from "./firebase_admin";
import { ensureEntitlement } from "./entitlements";
import { AnalyzeOfferPayload } from "./offer_analysis_types";
import { resolveOfferInput } from "./offer_input_resolver";
import { buildRouteVerification } from "./route_verification_builder";
import { assertOfferLimitAvailable, saveOfferWithUsage } from "./offer_usage";
import { assertDeviceActive } from "./device_registry";
import { readRequiredCurrentLocation } from "./current_location";

const routesApiKey = defineSecret("ROUTES_API_KEY");
const geocodingApiKey = defineSecret("GEOCODING_API_KEY");
const geminiModel = defineString("GEMINI_MODEL", {
  default: "gemini-3-flash-preview",
});

export const analyzeOffer = onCall(
  {
    cors: true,
    secrets: [routesApiKey, geocodingApiKey],
    timeoutSeconds: 60,
    memory: "256MiB",
    region: "europe-west1",
  },
  async (request) => {
    const startedAt = Date.now();
    const timingsMs: Record<string, number> = {};
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }

    const payload = request.data as AnalyzeOfferPayload;
    const deviceId = payload.deviceId?.trim();
    if (!deviceId) {
      throw new HttpsError("invalid-argument", "Missing deviceId.");
    }
    const currentLocation = readRequiredCurrentLocation(payload);
    const entitlement = await trackDuration(
      timingsMs,
      "guardChecks",
      async () => {
        await assertDeviceActive(uid, deviceId);
        const currentEntitlement = await ensureEntitlement(uid);
        await assertOfferLimitAvailable({ uid, entitlement: currentEntitlement });
        return currentEntitlement;
      }
    );
    const [resolved, profile] = await trackDuration(
      timingsMs,
      "offerInputAndProfileLoad",
      async () =>
        Promise.all([
          resolveOfferInput(payload, {
            model: geminiModel.value(),
          }),
          loadUserProfile(uid),
        ])
    );
    if (!resolved) {
      throw new HttpsError("invalid-argument", "Missing offer payload.");
    }
    const { offer, extraction } = resolved;
    const { costSettings, defaultVehicleId } = profile;
    const vehicleId = payload.vehicleId ?? defaultVehicleId;
    if (!vehicleId) {
      throw new HttpsError(
        "failed-precondition",
        "Vehicle is required for analysis."
      );
    }
    const vehicle = await trackDuration(timingsMs, "vehicleLoad", async () =>
      loadVehicleSnapshot(uid, vehicleId)
    );

    const routeVerification = await trackDuration(
      timingsMs,
      "routeVerification",
      async () =>
        buildRouteVerification({
          offer,
          vehicleType: vehicle.type,
          currentLocation,
          routesApiKey: routesApiKey.value(),
          geocodingApiKey: geocodingApiKey.value(),
        })
    );
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

    await trackDuration(timingsMs, "saveOffer", async () =>
      saveOfferWithUsage({
        uid,
        entitlement,
        docRef,
        document,
      })
    );
    logger.info("Offer analysis saved", {
      uid,
      offerId: docRef.id,
      source,
      runtime: process.version,
      totalDurationMs: Date.now() - startedAt,
      timingsMs,
    });

    return { record };
  }
);

function resolveSource(payload: AnalyzeOfferPayload): string {
  if (payload.imageBase64 && payload.mimeType) {
    return "screenshot";
  }
  return payload.source ?? "manual";
}

async function trackDuration<T>(
  timings: Record<string, number>,
  key: string,
  callback: () => Promise<T>
): Promise<T> {
  const startedAt = Date.now();
  try {
    return await callback();
  } finally {
    timings[key] = Date.now() - startedAt;
  }
}
