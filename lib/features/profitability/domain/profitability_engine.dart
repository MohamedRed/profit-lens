import 'cost_breakdown.dart';
import 'profitability_input.dart';

class ProfitabilityEngine {
  CostBreakdown evaluate(ProfitabilityInput input) {
    final distance = input.offer.distanceKm;
    final energyCost = distance *
        (input.vehicle.energyConsumptionPer100Km / 100) *
        input.costs.energyPricePerUnit;
    final maintenanceCost = distance * input.vehicle.maintenancePerKm;
    final depreciationCost = distance * input.vehicle.depreciationPerKm;
    final socialContributions =
        input.offer.payoutEuro * input.costs.socialContributionRate;
    final totalCosts =
        energyCost + maintenanceCost + depreciationCost + socialContributions;
    final netProfit = input.offer.payoutEuro - totalCosts;

    return CostBreakdown(
      energyCost: energyCost,
      maintenanceCost: maintenanceCost,
      depreciationCost: depreciationCost,
      socialContributions: socialContributions,
      totalCosts: totalCosts,
      netProfit: netProfit,
    );
  }
}
