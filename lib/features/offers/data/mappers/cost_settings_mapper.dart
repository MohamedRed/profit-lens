import '../../../profitability/domain/cost_settings.dart';
import '../../../profile/domain/fixed_cost_allocation.dart';
import '../../../../core/extensions/iterable_extensions.dart';

class CostSettingsMapper {
  CostSettings? fromDocument(Map<String, dynamic>? data) {
    if (data == null) return null;
    final socialRate = (data['socialContributionRate'] as num?)?.toDouble();
    final allocation = _allocationFromString(
      data['fixedCostAllocation'] as String?,
    );
    final monthlyFixedCosts = (data['monthlyFixedCosts'] as num?)?.toDouble();
    final monthlyHours = (data['monthlyWorkingHours'] as num?)?.toDouble();
    final monthlyDistance = (data['monthlyDistanceKm'] as num?)?.toDouble();
    final monthlyDeliveries = data['monthlyDeliveries'] as int?;
    if (socialRate == null ||
        allocation == null ||
        monthlyFixedCosts == null ||
        monthlyHours == null ||
        monthlyDistance == null ||
        monthlyDeliveries == null) {
      return null;
    }
    return CostSettings(
      socialContributionRate: socialRate,
      incomeTaxRate: (data['incomeTaxRate'] as num?)?.toDouble(),
      fixedCostAllocation: allocation,
      monthlyFixedCosts: monthlyFixedCosts,
      monthlyWorkingHours: monthlyHours,
      monthlyDistanceKm: monthlyDistance,
      monthlyDeliveries: monthlyDeliveries,
    );
  }

  Map<String, dynamic> toDocument(CostSettings settings) {
    return {
      'socialContributionRate': settings.socialContributionRate,
      'incomeTaxRate': settings.incomeTaxRate,
      'fixedCostAllocation': settings.fixedCostAllocation.name,
      'monthlyFixedCosts': settings.monthlyFixedCosts,
      'monthlyWorkingHours': settings.monthlyWorkingHours,
      'monthlyDistanceKm': settings.monthlyDistanceKm,
      'monthlyDeliveries': settings.monthlyDeliveries,
    };
  }

  FixedCostAllocation? _allocationFromString(String? value) {
    if (value == null) return null;
    return FixedCostAllocation.values
        .where((element) => element.name == value)
        .firstOrNull;
  }
}
