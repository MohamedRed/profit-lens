import 'business_activity.dart';
import 'fixed_cost_allocation.dart';

class UserProfile {
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
    required this.defaultVehicleId,
    required this.useFranceDefaults,
    required this.preferredLocale,
  });

  UserProfile copyWith({
    String? uid,
    String? email,
    String? countryCode,
    String? currencyCode,
    BusinessActivity? activity,
    double? socialContributionRate,
    double? incomeTaxRate,
    bool? useLiberatoryTax,
    FixedCostAllocation? fixedCostAllocation,
    double? monthlyFixedCosts,
    double? monthlyWorkingHours,
    double? monthlyDistanceKm,
    int? monthlyDeliveries,
    String? defaultVehicleId,
    bool? useFranceDefaults,
    String? preferredLocale,
  }) {
    return UserProfile(
      uid: uid ?? this.uid,
      email: email ?? this.email,
      countryCode: countryCode ?? this.countryCode,
      currencyCode: currencyCode ?? this.currencyCode,
      activity: activity ?? this.activity,
      socialContributionRate:
          socialContributionRate ?? this.socialContributionRate,
      incomeTaxRate: incomeTaxRate ?? this.incomeTaxRate,
      useLiberatoryTax: useLiberatoryTax ?? this.useLiberatoryTax,
      fixedCostAllocation: fixedCostAllocation ?? this.fixedCostAllocation,
      monthlyFixedCosts: monthlyFixedCosts ?? this.monthlyFixedCosts,
      monthlyWorkingHours: monthlyWorkingHours ?? this.monthlyWorkingHours,
      monthlyDistanceKm: monthlyDistanceKm ?? this.monthlyDistanceKm,
      monthlyDeliveries: monthlyDeliveries ?? this.monthlyDeliveries,
      defaultVehicleId: defaultVehicleId ?? this.defaultVehicleId,
      useFranceDefaults: useFranceDefaults ?? this.useFranceDefaults,
      preferredLocale: preferredLocale ?? this.preferredLocale,
    );
  }
}
