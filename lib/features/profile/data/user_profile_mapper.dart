import '../../../core/extensions/iterable_extensions.dart';
import '../../profile/domain/business_activity.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import '../../profile/domain/profile_defaults.dart';
import '../../profile/domain/user_profile.dart';

class UserProfileMapper {
  UserProfile? fromDocument(String uid, Map<String, dynamic>? data) {
    if (data == null) return null;
    final activity = _activityFromString(data['activity'] as String?);
    final allocation = _allocationFromString(
      data['fixedCostAllocation'] as String?,
    );
    final socialRate = (data['socialContributionRate'] as num?)?.toDouble();
    final fixedCosts = (data['monthlyFixedCosts'] as num?)?.toDouble();
    final monthlyHours = (data['monthlyWorkingHours'] as num?)?.toDouble();
    final monthlyDistance = (data['monthlyDistanceKm'] as num?)?.toDouble();
    final monthlyDeliveries = (data['monthlyDeliveries'] as num?)?.toInt();
    final minProfitability =
        (data['minProfitabilityEuro'] as num?)?.toDouble() ??
        ProfileDefaults.minProfitabilityEuro;
    final countryCode = data['countryCode'] as String?;
    final currencyCode = data['currencyCode'] as String?;
    final useFranceDefaults = data['useFranceDefaults'] as bool?;
    final useLiberatoryTax = data['useLiberatoryTax'] as bool? ?? false;
    final preferredLocale = data['preferredLocale'] as String?;

    if (activity == null ||
        allocation == null ||
        socialRate == null ||
        fixedCosts == null ||
        monthlyHours == null ||
        monthlyDistance == null ||
        monthlyDeliveries == null ||
        countryCode == null ||
        currencyCode == null ||
        useFranceDefaults == null) {
      return null;
    }

    return UserProfile(
      uid: uid,
      email: data['email'] as String?,
      countryCode: countryCode,
      currencyCode: currencyCode,
      activity: activity,
      socialContributionRate: socialRate,
      incomeTaxRate: (data['incomeTaxRate'] as num?)?.toDouble(),
      useLiberatoryTax: useLiberatoryTax,
      fixedCostAllocation: allocation,
      monthlyFixedCosts: fixedCosts,
      monthlyWorkingHours: monthlyHours,
      monthlyDistanceKm: monthlyDistance,
      monthlyDeliveries: monthlyDeliveries,
      minProfitabilityEuro: minProfitability,
      defaultVehicleId: data['defaultVehicleId'] as String?,
      useFranceDefaults: useFranceDefaults,
      preferredLocale: preferredLocale ?? 'fr',
    );
  }

  Map<String, dynamic> toDocument(UserProfile profile) {
    return {
      'email': profile.email,
      'countryCode': profile.countryCode,
      'currencyCode': profile.currencyCode,
      'activity': profile.activity.name,
      'socialContributionRate': profile.socialContributionRate,
      'incomeTaxRate': profile.incomeTaxRate,
      'useLiberatoryTax': profile.useLiberatoryTax,
      'fixedCostAllocation': profile.fixedCostAllocation.name,
      'monthlyFixedCosts': profile.monthlyFixedCosts,
      'monthlyWorkingHours': profile.monthlyWorkingHours,
      'monthlyDistanceKm': profile.monthlyDistanceKm,
      'monthlyDeliveries': profile.monthlyDeliveries,
      'minProfitabilityEuro': profile.minProfitabilityEuro,
      'defaultVehicleId': profile.defaultVehicleId,
      'useFranceDefaults': profile.useFranceDefaults,
      'preferredLocale': profile.preferredLocale,
    };
  }

  BusinessActivity? _activityFromString(String? value) {
    if (value == null) return null;
    return BusinessActivity.values
        .where((element) => element.name == value)
        .firstOrNull;
  }

  FixedCostAllocation? _allocationFromString(String? value) {
    if (value == null) return null;
    return FixedCostAllocation.values
        .where((element) => element.name == value)
        .firstOrNull;
  }
}
