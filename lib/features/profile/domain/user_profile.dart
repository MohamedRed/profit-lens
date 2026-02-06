import 'business_activity.dart';
import 'fixed_cost_allocation.dart';

class UserProfile {
  static const _nullSentinel = Object();

  final String uid;
  final String? email;
  final String countryCode;
  final String currencyCode;
  final BusinessActivity activity;
  final double socialContributionRate;
  final double? incomeTaxRate;
  final bool useLiberatoryTax;
  final FixedCostAllocation fixedCostAllocation;
  final double monthlyFixedCosts;
  final double monthlyWorkingHours;
  final double monthlyDistanceKm;
  final int monthlyDeliveries;
  final double minProfitabilityEuro;
  final String? defaultVehicleId;
  final bool useFranceDefaults;
  final String? preferredLocale;

  const UserProfile({
    required this.uid,
    required this.email,
    required this.countryCode,
    required this.currencyCode,
    required this.activity,
    required this.socialContributionRate,
    required this.incomeTaxRate,
    required this.useLiberatoryTax,
    required this.fixedCostAllocation,
    required this.monthlyFixedCosts,
    required this.monthlyWorkingHours,
    required this.monthlyDistanceKm,
    required this.monthlyDeliveries,
    required this.minProfitabilityEuro,
    required this.defaultVehicleId,
    required this.useFranceDefaults,
    required this.preferredLocale,
  });

  UserProfile copyWith({
    String? uid,
    Object? email = _nullSentinel,
    String? countryCode,
    String? currencyCode,
    BusinessActivity? activity,
    double? socialContributionRate,
    Object? incomeTaxRate = _nullSentinel,
    bool? useLiberatoryTax,
    FixedCostAllocation? fixedCostAllocation,
    double? monthlyFixedCosts,
    double? monthlyWorkingHours,
    double? monthlyDistanceKm,
    int? monthlyDeliveries,
    double? minProfitabilityEuro,
    Object? defaultVehicleId = _nullSentinel,
    bool? useFranceDefaults,
    Object? preferredLocale = _nullSentinel,
  }) {
    return UserProfile(
      uid: uid ?? this.uid,
      email:
          identical(email, _nullSentinel) ? this.email : email as String?,
      countryCode: countryCode ?? this.countryCode,
      currencyCode: currencyCode ?? this.currencyCode,
      activity: activity ?? this.activity,
      socialContributionRate:
          socialContributionRate ?? this.socialContributionRate,
      incomeTaxRate: identical(incomeTaxRate, _nullSentinel)
          ? this.incomeTaxRate
          : incomeTaxRate as double?,
      useLiberatoryTax: useLiberatoryTax ?? this.useLiberatoryTax,
      fixedCostAllocation: fixedCostAllocation ?? this.fixedCostAllocation,
      monthlyFixedCosts: monthlyFixedCosts ?? this.monthlyFixedCosts,
      monthlyWorkingHours: monthlyWorkingHours ?? this.monthlyWorkingHours,
      monthlyDistanceKm: monthlyDistanceKm ?? this.monthlyDistanceKm,
      monthlyDeliveries: monthlyDeliveries ?? this.monthlyDeliveries,
      minProfitabilityEuro:
          minProfitabilityEuro ?? this.minProfitabilityEuro,
      defaultVehicleId: identical(defaultVehicleId, _nullSentinel)
          ? this.defaultVehicleId
          : defaultVehicleId as String?,
      useFranceDefaults: useFranceDefaults ?? this.useFranceDefaults,
      preferredLocale: identical(preferredLocale, _nullSentinel)
          ? this.preferredLocale
          : preferredLocale as String?,
    );
  }
}
