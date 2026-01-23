import '../../../profitability/domain/cost_breakdown.dart';

class CostBreakdownMapper {
  CostBreakdown? fromDocument(Map<String, dynamic>? data) {
    if (data == null) return null;
    final energyCost = (data['energyCost'] as num?)?.toDouble();
    final maintenanceCost = (data['maintenanceCost'] as num?)?.toDouble();
    final depreciationCost = (data['depreciationCost'] as num?)?.toDouble();
    final socialContributions =
        (data['socialContributions'] as num?)?.toDouble();
    final incomeTax = (data['incomeTax'] as num?)?.toDouble();
    final fixedCostAllocation =
        (data['fixedCostAllocation'] as num?)?.toDouble();
    final totalCosts = (data['totalCosts'] as num?)?.toDouble();
    final netProfit = (data['netProfit'] as num?)?.toDouble();
    if (energyCost == null ||
        maintenanceCost == null ||
        depreciationCost == null ||
        socialContributions == null ||
        incomeTax == null ||
        fixedCostAllocation == null ||
        totalCosts == null ||
        netProfit == null) {
      return null;
    }
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

  Map<String, dynamic> toDocument(CostBreakdown breakdown) {
    return {
      'energyCost': breakdown.energyCost,
      'maintenanceCost': breakdown.maintenanceCost,
      'depreciationCost': breakdown.depreciationCost,
      'socialContributions': breakdown.socialContributions,
      'incomeTax': breakdown.incomeTax,
      'fixedCostAllocation': breakdown.fixedCostAllocation,
      'totalCosts': breakdown.totalCosts,
      'netProfit': breakdown.netProfit,
    };
  }
}
