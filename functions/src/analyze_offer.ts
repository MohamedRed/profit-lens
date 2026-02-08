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
    const deviceId = payload.deviceId?.trim();
    if (!deviceId) {
      throw new HttpsError("invalid-argument", "Missing deviceId.");
    }
    await assertDeviceActive(uid, deviceId);
    const entitlement = await ensureEntitlement(uid);
    await assertOfferLimitAvailable({ uid, entitlement });
    const resolved = await resolveOfferInput(payload, {
      apiKey: geminiApiKey.value(),
      model: geminiModel.value(),
    });
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
      routesApiKey: routesApiKey.value(),
      geocodingApiKey: geocodingApiKey.value(),
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

    await saveOfferWithUsage({
      uid,
      entitlement,
      docRef,
      document,
    });
    logger.info("Offer analysis saved", {
      uid,
      offerId: docRef.id,
      source,
      runtime: process.version,
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
