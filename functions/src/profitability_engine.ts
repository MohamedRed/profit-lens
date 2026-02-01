import {
  CostBreakdown,
  CostSettings,
  FixedCostAllocation,
  OfferInput,
  VehicleSnapshot,
} from "./profitability_types";

type ProfitabilityInput = {
  offer: OfferInput;
  vehicle: VehicleSnapshot;
  costs: CostSettings;
};

export function evaluateProfitability(input: ProfitabilityInput): CostBreakdown {
  const distance =
    input.offer.routeVerification?.distanceKm ?? input.offer.distanceKm;
  if (!distance || distance <= 0) {
    throw new Error("Missing offer distance.");
  }
  const energyCost =
    distance *
    (input.vehicle.energyConsumptionPer100Km / 100) *
    input.vehicle.energyPricePerUnit;
  const maintenanceCost = distance * input.vehicle.maintenancePerKm;
  const depreciationCost = distance * input.vehicle.depreciationPerKm;
  const socialContributions =
    input.offer.payoutEuro * input.costs.socialContributionRate;
  const incomeTax = input.offer.payoutEuro * (input.costs.incomeTaxRate ?? 0);
  const fixedCostAllocation = calculateFixedCostAllocation(input, distance);
  const totalCosts =
    energyCost +
    maintenanceCost +
    depreciationCost +
    socialContributions +
    incomeTax +
    fixedCostAllocation;
  const netProfit = input.offer.payoutEuro - totalCosts;

  return {
    energyCost,
    maintenanceCost,
    depreciationCost,
    socialContributions,
    incomeTax,
    fixedCostAllocation,
    totalCosts,
    netProfit,
  };
}

function calculateFixedCostAllocation(
  input: ProfitabilityInput,
  distanceKm: number
): number {
  if (input.costs.monthlyFixedCosts <= 0) {
    return 0;
  }
  switch (input.costs.fixedCostAllocation) {
    case "perHour": {
      const durationMinutes =
        input.offer.routeVerification?.durationMinutes ??
        input.offer.durationMinutes;
      if (!durationMinutes || durationMinutes <= 0) {
        throw new Error("Missing offer duration for hourly allocation.");
      }
      if (input.costs.monthlyWorkingHours <= 0) {
        throw new Error("Monthly working hours must be set.");
      }
      return (
        (input.costs.monthlyFixedCosts / input.costs.monthlyWorkingHours) *
        (durationMinutes / 60)
      );
    }
    case "perKm": {
      if (input.costs.monthlyDistanceKm <= 0) {
        throw new Error("Monthly distance must be set.");
      }
      return (
        (input.costs.monthlyFixedCosts / input.costs.monthlyDistanceKm) *
        distanceKm
      );
    }
    case "perDelivery": {
      if (input.costs.monthlyDeliveries <= 0) {
        throw new Error("Monthly deliveries must be set.");
      }
      return input.costs.monthlyFixedCosts / input.costs.monthlyDeliveries;
    }
    default: {
      return assertUnreachable(input.costs.fixedCostAllocation);
    }
  }
}

function assertUnreachable(value: FixedCostAllocation): number {
  throw new Error(`Unknown fixed cost allocation: ${value}`);
}
