import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { loadUserProfile, loadVehicleSnapshot } from "./profile_vehicle_loader";
import { evaluateProfitability } from "./profitability_engine";
import { buildOfferRecordPayload } from "./offer_record_mapper";
import { OfferInput, RouteVerification } from "./profitability_types";
import { db } from "./firebase_admin";

type AnalyzeOfferPayload = {
  offer?: OfferInput;
  routeVerification?: RouteVerification;
  vehicleId?: string;
  source?: string;
  extraction?: { confidence?: number; rawText?: string | null };
};

export const analyzeOffer = onCall(
  {
    cors: true,
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
    const offer = normalizeOffer(payload.offer);
    if (!offer) {
      throw new HttpsError("invalid-argument", "Missing offer payload.");
    }

    if (payload.routeVerification) {
      offer.routeVerification = payload.routeVerification;
    }

    const { costSettings, defaultVehicleId } = await loadUserProfile(uid);
    const vehicleId = payload.vehicleId ?? defaultVehicleId;
    if (!vehicleId) {
      throw new HttpsError(
        "failed-precondition",
        "Vehicle is required for analysis."
      );
    }
    const vehicle = await loadVehicleSnapshot(uid, vehicleId);

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

    const source = payload.source ?? "manual";
    const extraction = normalizeExtraction(payload.extraction);
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

    await docRef.set(document, { merge: true });
    logger.info("Offer analysis saved", {
      uid,
      offerId: docRef.id,
      source,
    });

    return { record };
  }
);

function normalizeOffer(input?: OfferInput): OfferInput | null {
  if (!input) {
    return null;
  }
  const payout = toNumber(input.payoutEuro);
  const distance = toNumber(input.distanceKm);
  if (payout == null || distance == null) {
    return null;
  }
  return {
    payoutEuro: payout,
    distanceKm: distance,
    durationMinutes: toNumber(input.durationMinutes),
    pickupName: normalizeString(input.pickupName),
    pickupAddress: normalizeString(input.pickupAddress),
    dropoffName: normalizeString(input.dropoffName),
    dropoffAddress: normalizeString(input.dropoffAddress),
    routeVerification: input.routeVerification ?? undefined,
  };
}

function normalizeExtraction(input?: {
  confidence?: number;
  rawText?: string | null;
}) {
  if (!input) return null;
  const confidence = toNumber(input.confidence);
  if (confidence == null) return null;
  return {
    confidence,
    rawText: normalizeString(input.rawText),
  };
}

function normalizeString(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length == 0 ? null : trimmed;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}
