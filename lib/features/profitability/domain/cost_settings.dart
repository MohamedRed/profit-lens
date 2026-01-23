import '../../profile/domain/fixed_cost_allocation.dart';

class CostSettings {
  final double socialContributionRate;
  final double? incomeTaxRate;
  final FixedCostAllocation fixedCostAllocation;
  final double monthlyFixedCosts;
  final double monthlyWorkingHours;
  final double monthlyDistanceKm;
  final int monthlyDeliveries;

  const CostSettings({
    required this.socialContributionRate,
    required this.incomeTaxRate,
    required this.fixedCostAllocation,
    required this.monthlyFixedCosts,
    required this.monthlyWorkingHours,
    required this.monthlyDistanceKm,
    required this.monthlyDeliveries,
  });
}
