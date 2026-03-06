export interface OfferCurrentLocation {
  lat: number;
  lng: number;
}

export interface OfferInputPayload {
  payoutEuro: number;
  distanceKm?: number;
  durationMinutes?: number;
  pickupName?: string;
  pickupAddress?: string;
  dropoffName?: string;
  dropoffAddress?: string;
}

export interface OfferRecord {
  id: string;
  source: string;
  createdAt: Date | null;
  analysisMode?: 'single' | 'bulk';
  importBatchId?: string;
  distanceSource?: 'actual' | 'estimated';
  payoutEuro: number;
  distanceKm: number;
  durationMinutes?: number;
  tipEuro?: number;
  routeVerifiedDurationMinutes?: number;
  pickupName?: string;
  pickupAddress?: string;
  dropoffName?: string;
  dropoffAddress?: string;
  netProfitEuro?: number;
  totalCostsEuro?: number;
  energyCostEuro?: number;
  maintenanceCostEuro?: number;
  depreciationCostEuro?: number;
  socialContributionsEuro?: number;
  incomeTaxEuro?: number;
  fixedCostAllocationEuro?: number;
  routeVerifiedDistanceKm?: number;
  localDayId?: string;
  localDayStart?: Date | null;
}

export interface OfferStatsDay {
  dayStart: Date;
  offerCount: number;
  netProfitEuro: number;
}
