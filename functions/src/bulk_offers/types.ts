import { ExtractionIssue, ExtractedOfferCandidate } from "../offer_extraction_core/types";

export type BulkSourceApp = "uber_eats" | "deliveroo" | "other";

export type ScreenshotRef = {
  bucket: string;
  path: string;
  sha256: string;
  uploadedAtIso: string;
};

export type BulkParsedRow = {
  sourceIndex: number;
  payoutEuro: number;
  distanceKm: number;
  durationMinutes: number;
  deliveryTime: string;
  pickupName: string | null;
  pickupAddress: string | null;
  dropoffName: string | null;
  dropoffAddress: string | null;
  tipEuro: number | null;
  confidence: number | null;
};

export type BulkInvalidRow = {
  sourceIndex: number;
  raw: ExtractedOfferCandidate;
  issues: ExtractionIssue[];
};

export type ParseBulkOffersScreenshotRequest = {
  deviceId?: string;
  vehicleId?: string;
  timezone?: string;
  serviceDateIso?: string;
  imageBase64?: string;
  mimeType?: string;
  sourceApp?: BulkSourceApp;
};

export type ParseBulkOffersScreenshotResponse = {
  screenshotRef: ScreenshotRef;
  parsedRows: BulkParsedRow[];
  invalidRows: BulkInvalidRow[];
  parseMeta: {
    providerHint: string | null;
    confidenceAvg: number | null;
    rawTextStored: boolean;
  };
};

export type BulkCommitRow = {
  payoutEuro: number;
  distanceKm: number;
  durationMinutes: number;
  deliveryTime: string;
  pickupName?: string | null;
  pickupAddress?: string | null;
  dropoffName?: string | null;
  dropoffAddress?: string | null;
  tipEuro?: number | null;
  confidence?: number | null;
};

export type CommitBulkOffersImportRequest = {
  deviceId?: string;
  timezone?: string;
  serviceDateIso?: string;
  vehicleId?: string;
  sourceApp?: BulkSourceApp;
  screenshotRefs?: Array<{
    bucket?: string;
    path?: string;
    sha256?: string;
  }>;
  rows?: BulkCommitRow[];
};

export type CommitBulkOffersImportResponse = {
  importBatchId: string;
  savedCount: number;
  skippedCount: number;
  skipped: BulkInvalidRow[];
  usage: {
    periodKey: string;
    usedAfter: number;
    limit: number | null;
    remaining: number | null;
  };
  kpis: {
    day: ShiftKpi;
    rolling7d: ShiftKpi;
  };
};

export type ShiftKpi = {
  deliveries: number;
  revenueEuro: number;
  netProfitEuro: number;
  distanceKm: number;
  avgProfitPerDeliveryEuro: number;
};
