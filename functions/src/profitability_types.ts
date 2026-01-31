export type FixedCostAllocation = "perHour" | "perKm" | "perDelivery";

export type RouteVerification = {
  distanceKm: number;
  durationMinutes: number;
  provider: string;
  travelMode: string;
  verifiedAt: string;
};

export type OfferInput = {
  payoutEuro: number;
  distanceKm: number;
  durationMinutes?: number | null;
  pickupName?: string | null;
  pickupAddress?: string | null;
  dropoffName?: string | null;
  dropoffAddress?: string | null;
  routeVerification?: RouteVerification | null;
};

export type VehicleSnapshot = {
  id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  type: string;
  energyType: string;
  fuelType?: string | null;
  energyConsumptionPer100Km: number;
  energyPricePerUnit: number;
  maintenancePerKm: number;
  depreciationPerKm: number;
};

export type CostSettings = {
  socialContributionRate: number;
  incomeTaxRate?: number | null;
  fixedCostAllocation: FixedCostAllocation;
  monthlyFixedCosts: number;
  monthlyWorkingHours: number;
  monthlyDistanceKm: number;
  monthlyDeliveries: number;
};

export type CostBreakdown = {
  energyCost: number;
  maintenanceCost: number;
  depreciationCost: number;
  socialContributions: number;
  incomeTax: number;
  fixedCostAllocation: number;
  totalCosts: number;
  netProfit: number;
};

export type OfferExtraction = {
  confidence: number;
  rawText?: string | null;
};

export type OfferRecordData = {
  id: string;
  offer: OfferInput;
  source: string;
  createdAt: string;
  vehicleSnapshot: VehicleSnapshot;
  costSnapshot: CostSettings;
  breakdown: CostBreakdown;
  extraction?: OfferExtraction | null;
};
