import { describe, expect, it } from 'vitest';
import type { BulkParsedRow } from '../../../../lib/types/bulk-offers';
import type { UserProfile } from '../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import { buildBulkReviewAnalysisPreview, resolveBulkDefaultVehicle } from './bulk-review-analysis';

const profile: UserProfile = {
  uid: 'user-1',
  email: 'driver@example.com',
  countryCode: 'FR',
  currencyCode: 'EUR',
  activity: 'deliveryServices',
  socialContributionRate: 0.2,
  incomeTaxRate: 0.1,
  useLiberatoryTax: false,
  fixedCostAllocation: 'perDelivery',
  monthlyFixedCosts: 120,
  monthlyWorkingHours: 160,
  monthlyDistanceKm: 3000,
  monthlyDeliveries: 120,
  minProfitabilityEuro: 2,
  defaultVehicleId: 'vehicle-2',
  useFranceDefaults: true,
  preferredLocale: 'fr',
};

const vehicles: VehicleProfile[] = [
  {
    id: 'vehicle-1',
    name: 'Fallback vehicle',
    type: 'car',
    energyType: 'fuel',
    energyConsumptionPer100Km: 5,
    energyPricePerUnit: 1.5,
    maintenancePerKm: 0.12,
    depreciationPerKm: 0.08,
  },
  {
    id: 'vehicle-2',
    name: 'Default vehicle',
    type: 'car',
    energyType: 'fuel',
    energyConsumptionPer100Km: 6,
    energyPricePerUnit: 1.5,
    maintenancePerKm: 0.1,
    depreciationPerKm: 0.2,
  },
];

const row: BulkParsedRow = {
  sourceIndex: 0,
  payoutEuro: 10,
  distanceKm: 5,
  durationMinutes: 20,
  deliveryTime: '12:00',
  pickupName: 'Pickup',
  pickupAddress: null,
  dropoffName: 'Dropoff',
  dropoffAddress: null,
  tipEuro: 2,
  confidence: 0.92,
};

describe('bulk-review-analysis', () => {
  it('uses the default vehicle when available', () => {
    expect(resolveBulkDefaultVehicle(vehicles, 'vehicle-2')?.id).toBe('vehicle-2');
  });

  it('computes profitability preview including tip and recommendation', () => {
    const preview = buildBulkReviewAnalysisPreview(row, profile, vehicles[1]!);

    expect(preview).not.toBeNull();
    expect(preview?.grossRevenueEuro).toBe(12);
    expect(preview?.totalCostsEuro).toBeCloseTo(6.55, 2);
    expect(preview?.netProfitEuro).toBeCloseTo(5.45, 2);
    expect(preview?.minimumTargetEuro).toBe(10);
    expect(preview?.recommendedAction).toBe('decline');
  });

  it('returns null when fixed cost setup is incomplete for hourly allocation', () => {
    const hourlyProfile: UserProfile = {
      ...profile,
      fixedCostAllocation: 'perHour',
      monthlyWorkingHours: 0,
    };

    expect(buildBulkReviewAnalysisPreview(row, hourlyProfile, vehicles[1]!)).toBeNull();
  });
});
