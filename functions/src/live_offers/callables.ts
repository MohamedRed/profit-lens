import { HttpsError, onCall } from "firebase-functions/v2/https";
import { db } from "../firebase_admin";
import { ensureEntitlement } from "../entitlements";
import { loadUserProfile, loadVehicleSnapshot } from "../profile_vehicle_loader";
import { buildRouteVerification } from "../route_verification_builder";
import { buildOfferRecordPayload } from "../offer_record_mapper";
import { readOfferUsageCount } from "../offer_usage";
import { assertDeviceActive } from "../device_registry";
import { resolveDayStartFromDayId, resolveLocalDayId } from "../local_day";
import { geocodingApiKey, routesApiKey } from "../offer_runtime_config";
import { readLiveOfferPayload } from "./payload";
import { evaluateLiveOfferScore } from "./scoring";
import { commitLiveOfferStorage } from "./commit_store";
import type { LiveCommitResponse, LiveScoreResponse } from "./types";

const liveCallableConfig = {
  cors: true,
  timeoutSeconds: 60,
  memory: "256MiB" as const,
  region: "europe-west1",
  secrets: [routesApiKey, geocodingApiKey],
};

export const scoreLiveOffer = onCall(liveCallableConfig, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const payload = readLiveOfferPayload(request.data);
  await assertDeviceActive(uid, payload.deviceId);
  const { profile, vehicle } = await loadLiveScoringContext(uid, payload.vehicleId);

  const evaluation = await evaluateLiveOfferScore({
    offer: payload.offer,
    provider: payload.provider,
    currentLocation: payload.currentLocation,
    vehicle,
    costSettings: profile.costSettings,
    minProfitabilityEuro: profile.minProfitabilityEuro,
    buildRouteVerification: async () => {
      if (!payload.currentLocation) {
        throw new HttpsError("failed-precondition", "Current location is required for route verification.");
      }
      return buildRouteVerification({
        offer: payload.offer,
        vehicleType: vehicle.type,
        currentLocation: payload.currentLocation,
        routesApiKey: routesApiKey.value(),
        geocodingApiKey: geocodingApiKey.value(),
      });
    },
  });

  const response: LiveScoreResponse = {
    sessionId: payload.liveOfferSessionId,
    status: evaluation.status,
    reasonCode: evaluation.reasonCode,
    summary: evaluation.summary,
  };
  return response;
});

export const commitLiveOfferVerdict = onCall(liveCallableConfig, async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const payload = readLiveOfferPayload(request.data);
  await assertDeviceActive(uid, payload.deviceId);

  const entitlement = await ensureEntitlement(uid);
  const { profile, vehicle } = await loadLiveScoringContext(uid, payload.vehicleId);
  const evaluation = await evaluateLiveOfferScore({
    offer: payload.offer,
    provider: payload.provider,
    currentLocation: payload.currentLocation,
    vehicle,
    costSettings: profile.costSettings,
    minProfitabilityEuro: profile.minProfitabilityEuro,
    buildRouteVerification: async () => {
      if (!payload.currentLocation) {
        throw new HttpsError("failed-precondition", "Current location is required for route verification.");
      }
      return buildRouteVerification({
        offer: payload.offer,
        vehicleType: vehicle.type,
        currentLocation: payload.currentLocation,
        routesApiKey: routesApiKey.value(),
        geocodingApiKey: geocodingApiKey.value(),
      });
    },
  });
  if (evaluation.status === "unknown" || !evaluation.offer) {
    throw new HttpsError("failed-precondition", "Cannot commit a live offer without a stable verdict.");
  }
  if (!evaluation.breakdown) {
    throw new HttpsError("internal", "Live offer scoring did not produce a cost breakdown.");
  }

  const createdAt = new Date();
  const localDayId = resolveLocalDayId(createdAt, payload.timezone ?? null);
  const localDayStart = resolveDayStartFromDayId(localDayId);
  const offerRef = db.collection("users").doc(uid).collection("offers").doc();
  const { document } = buildOfferRecordPayload({
    id: offerRef.id,
    offer: evaluation.offer,
    source: "android_accessibility_live",
    createdAt,
    vehicleSnapshot: vehicle,
    costSnapshot: profile.costSettings,
    breakdown: evaluation.breakdown,
    localDayId,
    localDayStart,
    analysisMode: "single",
    distanceSource: evaluation.offer.routeVerification ? "estimated" : "actual",
    liveContext: {
      provider: payload.provider,
      liveOfferSessionId: payload.liveOfferSessionId,
      captureContext: payload.captureContext,
    },
  });

  const stored = await commitLiveOfferStorage({
    uid,
    entitlement,
    deviceId: payload.deviceId,
    liveOfferSessionId: payload.liveOfferSessionId,
    provider: payload.provider,
    offerId: offerRef.id,
    offerDocument: document,
  });
  const usedAfter = stored.usedAfter ?? (await readOfferUsageCount({ uid, entitlement }));
  const response: LiveCommitResponse = {
    sessionId: payload.liveOfferSessionId,
    offerId: stored.offerId,
    status: stored.status,
    usage: {
      periodKey: entitlement.periodKey,
      usedAfter,
      limit: entitlement.offerLimit,
      remaining:
        entitlement.offerLimit == null ? null : Math.max(0, entitlement.offerLimit - usedAfter),
    },
  };
  return response;
});

async function loadLiveScoringContext(uid: string, explicitVehicleId?: string) {
  const profile = await loadUserProfile(uid);
  const vehicleId = explicitVehicleId ?? profile.defaultVehicleId;
  if (!vehicleId) {
    throw new HttpsError("failed-precondition", "Vehicle is required for live offer scoring.");
  }
  const vehicle = await loadVehicleSnapshot(uid, vehicleId);
  return { profile, vehicle };
}
