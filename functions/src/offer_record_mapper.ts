import { FieldValue } from "firebase-admin/firestore";
import {
  CostBreakdown,
  CostSettings,
  OfferExtraction,
  OfferInput,
  OfferRecordData,
  VehicleSnapshot,
} from "./profitability_types";

type OfferRecordParams = {
  id: string;
  offer: OfferInput;
  source: string;
  createdAt: Date;
  vehicleSnapshot: VehicleSnapshot;
  costSnapshot: CostSettings;
  breakdown: CostBreakdown;
  extraction?: OfferExtraction | null;
};

export function buildOfferRecordPayload(params: OfferRecordParams) {
  const offer = {
    ...params.offer,
    routeVerification: params.offer.routeVerification ?? undefined,
  };
  const record: OfferRecordData = {
    id: params.id,
    offer,
    source: params.source,
    createdAt: params.createdAt.toISOString(),
    vehicleSnapshot: params.vehicleSnapshot,
    costSnapshot: params.costSnapshot,
    breakdown: params.breakdown,
    extraction: params.extraction ?? null,
  };

  const document: Record<string, unknown> = {
    payoutEuro: params.offer.payoutEuro,
    distanceKm: params.offer.distanceKm,
    durationMinutes: params.offer.durationMinutes ?? null,
    pickupName: params.offer.pickupName ?? null,
    pickupAddress: params.offer.pickupAddress ?? null,
    dropoffName: params.offer.dropoffName ?? null,
    dropoffAddress: params.offer.dropoffAddress ?? null,
    source: params.source,
    createdAt: FieldValue.serverTimestamp(),
    vehicleSnapshot: params.vehicleSnapshot,
    costSnapshot: params.costSnapshot,
    breakdown: params.breakdown,
  };

  if (params.offer.routeVerification) {
    document.routeVerification = params.offer.routeVerification;
  }
  if (params.extraction) {
    document.extraction = {
      confidence: params.extraction.confidence,
      rawText: params.extraction.rawText ?? null,
    };
  }

  return { record, document };
}
