import type { GeoPoint, LiveOfferCaptureContext, LiveOfferProvider, OfferInput } from "../profitability_types";

export type LiveOverlayStatus = "profitable" | "not_profitable" | "unknown";

export type LiveOfferPayload = {
  deviceId?: string;
  vehicleId?: string;
  timezone?: string;
  currentLocation?: GeoPoint;
  offer?: OfferInput;
  provider?: LiveOfferProvider;
  liveOfferSessionId?: string;
  captureContext?: LiveOfferCaptureContext;
};

export type LiveScoreSummary = {
  provider: LiveOfferProvider;
  payoutEuro: number;
  distanceKm: number;
  durationMinutes: number | null;
  netProfitEuro: number;
  minimumTargetEuro: number;
  profitable: boolean;
  pickupAddress: string | null;
  dropoffAddress: string | null;
};

export type LiveScoreResponse = {
  sessionId: string;
  status: LiveOverlayStatus;
  reasonCode: string | null;
  summary: LiveScoreSummary | null;
};

export type LiveCommitResponse = {
  sessionId: string;
  offerId: string;
  status: "committed" | "deduplicated";
  usage: {
    periodKey: string;
    usedAfter: number | null;
    limit: number | null;
    remaining: number | null;
  };
};
