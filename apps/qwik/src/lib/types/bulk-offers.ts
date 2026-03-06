export type BulkSourceApp = 'uber_eats' | 'deliveroo' | 'other';

export type ExtractionIssueCode =
  | 'missing-payout'
  | 'missing-distance'
  | 'missing-duration'
  | 'missing-time'
  | 'invalid-number'
  | 'invalid-time';

export interface ExtractionIssue {
  code: ExtractionIssueCode;
  field: string;
  message: string;
}

export interface BulkParsedRow {
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
}

export interface BulkInvalidRow {
  sourceIndex: number;
  raw: Record<string, unknown>;
  issues: ExtractionIssue[];
}

export interface ScreenshotRef {
  bucket: string;
  path: string;
  sha256: string;
  uploadedAtIso: string;
}

export interface ParseBulkOffersScreenshotResponse {
  screenshotRef: ScreenshotRef;
  parsedRows: BulkParsedRow[];
  invalidRows: BulkInvalidRow[];
  parseMeta: {
    providerHint: string | null;
    confidenceAvg: number | null;
    rawTextStored: boolean;
  };
}

export interface BulkCommitRow {
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
}

export interface ShiftKpi {
  deliveries: number;
  revenueEuro: number;
  netProfitEuro: number;
  distanceKm: number;
  avgProfitPerDeliveryEuro: number;
}

export interface CommitBulkOffersImportResponse {
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
}
