export type ExtractionIssueCode =
  | "missing-payout"
  | "missing-distance"
  | "missing-duration"
  | "missing-time"
  | "invalid-number"
  | "invalid-time";

export type ExtractionIssue = {
  code: ExtractionIssueCode;
  field: string;
  message: string;
};

export type ExtractedOfferCandidate = {
  payoutEuro?: unknown;
  distanceKm?: unknown;
  durationMinutes?: unknown;
  deliveryTime?: unknown;
  pickupName?: unknown;
  pickupAddress?: unknown;
  dropoffName?: unknown;
  dropoffAddress?: unknown;
  tipEuro?: unknown;
  confidence?: unknown;
};

export type NormalizedOfferRow = {
  payoutEuro: number | null;
  distanceKm: number | null;
  durationMinutes: number | null;
  deliveryTime: string | null;
  pickupName: string | null;
  pickupAddress: string | null;
  dropoffName: string | null;
  dropoffAddress: string | null;
  tipEuro: number | null;
  confidence: number | null;
};
