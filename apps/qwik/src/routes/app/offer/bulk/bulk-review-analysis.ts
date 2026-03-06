import type { BulkParsedRow } from '../../../../lib/types/bulk-offers';
import type { UserProfile } from '../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../lib/types/vehicle';

export interface BulkReviewAnalysisPreview {
  grossRevenueEuro: number;
  netProfitEuro: number;
  totalCostsEuro: number;
  energyCostEuro: number;
  maintenanceCostEuro: number;
  depreciationCostEuro: number;
  socialContributionsEuro: number;
  incomeTaxEuro: number;
  fixedCostAllocationEuro: number;
  minimumTargetEuro: number;
  targetDeltaEuro: number;
  recommendedAction: 'accept' | 'decline';
}

export const resolveBulkDefaultVehicle = (
  vehicles: VehicleProfile[],
  defaultVehicleId: string | null,
): VehicleProfile | null => {
  if (defaultVehicleId) {
    const matchingVehicle = vehicles.find((vehicle) => vehicle.id === defaultVehicleId);
    if (matchingVehicle) {
      return matchingVehicle;
    }
  }

  return vehicles[0] ?? null;
};

export const buildBulkReviewAnalysisPreview = (
  row: BulkParsedRow,
  profile: UserProfile,
  vehicle: VehicleProfile,
): BulkReviewAnalysisPreview | null => {
  if (!Number.isFinite(row.distanceKm) || row.distanceKm <= 0) {
    return null;
  }

  const grossRevenueEuro = row.payoutEuro + (row.tipEuro ?? 0);
  const energyCostEuro =
    row.distanceKm *
    (vehicle.energyConsumptionPer100Km / 100) *
    vehicle.energyPricePerUnit;
  const maintenanceCostEuro = row.distanceKm * vehicle.maintenancePerKm;
  const depreciationCostEuro = row.distanceKm * vehicle.depreciationPerKm;
  const socialContributionsEuro = grossRevenueEuro * profile.socialContributionRate;
  const incomeTaxEuro = grossRevenueEuro * (profile.incomeTaxRate ?? 0);
  const fixedCostAllocationEuro = resolveFixedCostAllocationEuro(row, profile);
  if (fixedCostAllocationEuro == null) {
    return null;
  }

  const totalCostsEuro =
    energyCostEuro +
    maintenanceCostEuro +
    depreciationCostEuro +
    socialContributionsEuro +
    incomeTaxEuro +
    fixedCostAllocationEuro;
  const netProfitEuro = grossRevenueEuro - totalCostsEuro;
  const minimumTargetEuro = profile.minProfitabilityEuro * row.distanceKm;
  const targetDeltaEuro = netProfitEuro - minimumTargetEuro;

  return {
    grossRevenueEuro,
    netProfitEuro,
    totalCostsEuro,
    energyCostEuro,
    maintenanceCostEuro,
    depreciationCostEuro,
    socialContributionsEuro,
    incomeTaxEuro,
    fixedCostAllocationEuro,
    minimumTargetEuro,
    targetDeltaEuro,
    recommendedAction: targetDeltaEuro >= 0 ? 'accept' : 'decline',
  };
};

const resolveFixedCostAllocationEuro = (
  row: BulkParsedRow,
  profile: UserProfile,
): number | null => {
  if (profile.monthlyFixedCosts <= 0) {
    return 0;
  }

  switch (profile.fixedCostAllocation) {
    case 'perHour':
      if (!Number.isFinite(row.durationMinutes) || row.durationMinutes <= 0 || profile.monthlyWorkingHours <= 0) {
        return null;
      }
      return (profile.monthlyFixedCosts / profile.monthlyWorkingHours) * (row.durationMinutes / 60);
    case 'perKm':
      if (profile.monthlyDistanceKm <= 0) {
        return null;
      }
      return (profile.monthlyFixedCosts / profile.monthlyDistanceKm) * row.distanceKm;
    case 'perDelivery':
      if (profile.monthlyDeliveries <= 0) {
        return null;
      }
      return profile.monthlyFixedCosts / profile.monthlyDeliveries;
    default:
      return null;
  }
};
