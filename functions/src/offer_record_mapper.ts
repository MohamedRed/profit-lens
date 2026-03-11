import { FieldValue } from "firebase-admin/firestore";
import {
  CostBreakdown,
  CostSettings,
  LiveOfferCaptureContext,
  LiveOfferProvider,
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
  createdAtMode?: "server" | "fixed";
  localDayId?: string;
  localDayStart?: Date;
  analysisMode?: "single" | "bulk";
  distanceSource?: "actual" | "estimated";
  importBatchId?: string;
  tipEuro?: number | null;
  bulkContext?: {
    timezone: string;
    sourceApp: string;
    screenshotCount: number;
  };
  liveContext?: {
    provider: LiveOfferProvider;
    liveOfferSessionId: string;
    captureContext: LiveOfferCaptureContext;
  };
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
    provider: params.liveContext?.provider ?? null,
    liveOfferSessionId: params.liveContext?.liveOfferSessionId ?? null,
    captureContext: params.liveContext?.captureContext ?? null,
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
    createdAt:
      params.createdAtMode === "fixed"
        ? params.createdAt
        : FieldValue.serverTimestamp(),
    vehicleSnapshot: params.vehicleSnapshot,
    costSnapshot: params.costSnapshot,
    breakdown: params.breakdown,
  };

  if (params.localDayId) {
    document.localDayId = params.localDayId;
  }
  if (params.localDayStart) {
    document.localDayStart = params.localDayStart;
  }
  if (params.analysisMode) {
    document.analysisMode = params.analysisMode;
  }
  if (params.distanceSource) {
    document.distanceSource = params.distanceSource;
  }
  if (params.importBatchId) {
    document.importBatchId = params.importBatchId;
  }
  if (params.tipEuro != null) {
    document.tipEuro = params.tipEuro;
  }
  if (params.bulkContext) {
    document.bulkContext = params.bulkContext;
  }
  if (params.liveContext) {
    document.provider = params.liveContext.provider;
    document.liveOfferSessionId = params.liveContext.liveOfferSessionId;
    document.captureContext = params.liveContext.captureContext;
  }

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
