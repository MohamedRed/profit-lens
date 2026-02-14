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
  payoutEuro: number;
  distanceKm: number;
  durationMinutes?: number;
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
}

export interface OfferStatsDay {
  dayStart: Date;
  offerCount: number;
  netProfitEuro: number;
}
