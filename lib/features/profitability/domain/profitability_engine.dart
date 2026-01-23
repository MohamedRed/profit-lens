import 'cost_breakdown.dart';
import 'profitability_input.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import 'cost_settings.dart';

class ProfitabilityEngine {
  CostBreakdown evaluate(ProfitabilityInput input) {
    final distance = input.offer.distanceKm;
    final energyCost = distance *
        (input.vehicle.energyConsumptionPer100Km / 100) *
        input.vehicle.energyPricePerUnit;
    final maintenanceCost = distance * input.vehicle.maintenancePerKm;
    final depreciationCost = distance * input.vehicle.depreciationPerKm;
    final socialContributions =
        input.offer.payoutEuro * input.costs.socialContributionRate;
    final incomeTax =
        input.offer.payoutEuro * (input.costs.incomeTaxRate ?? 0);
    final fixedCostAllocation = _fixedCostAllocation(
      input: input,
      costs: input.costs,
    );
    final totalCosts = energyCost +
        maintenanceCost +
        depreciationCost +
        socialContributions +
        incomeTax +
        fixedCostAllocation;
    final netProfit = input.offer.payoutEuro - totalCosts;

    return CostBreakdown(
      energyCost: energyCost,
      maintenanceCost: maintenanceCost,
      depreciationCost: depreciationCost,
      socialContributions: socialContributions,
      incomeTax: incomeTax,
      fixedCostAllocation: fixedCostAllocation,
      totalCosts: totalCosts,
      netProfit: netProfit,
    );
  }

  double _fixedCostAllocation({
    required ProfitabilityInput input,
    required CostSettings costs,
  }) {
    if (costs.monthlyFixedCosts <= 0) {
      return 0;
    }
    switch (costs.fixedCostAllocation) {
      case FixedCostAllocation.perHour:
        final durationMinutes = input.offer.durationMinutes;
        if (durationMinutes == null || durationMinutes <= 0) {
          throw StateError('Missing offer duration for hourly allocation.');
        }
        if (costs.monthlyWorkingHours <= 0) {
          throw StateError('Monthly working hours must be set.');
        }
        return (costs.monthlyFixedCosts / costs.monthlyWorkingHours) *
            (durationMinutes / 60);
      case FixedCostAllocation.perKm:
        if (costs.monthlyDistanceKm <= 0) {
          throw StateError('Monthly distance must be set.');
        }
        return (costs.monthlyFixedCosts / costs.monthlyDistanceKm) *
            input.offer.distanceKm;
      case FixedCostAllocation.perDelivery:
        if (costs.monthlyDeliveries <= 0) {
          throw StateError('Monthly deliveries must be set.');
        }
        return costs.monthlyFixedCosts / costs.monthlyDeliveries;
    }
  }
}
