import '../../../../l10n/app_localizations.dart';
import '../../../profile/domain/fixed_cost_allocation.dart';
import '../../../profile/domain/user_profile.dart';
import '../../../vehicles/domain/energy_type.dart';
import '../../../vehicles/domain/vehicle_profile.dart';
import 'missing_data_section.dart';

List<MissingDataSection> buildMissingDataSections({
  required AppLocalizations l10n,
  required UserProfile profile,
  required VehicleProfile vehicle,
}) {
  final profileItems = <String>[];
  if (profile.socialContributionRate <= 0) {
    profileItems.add(l10n.socialRateLabel);
  }
  if (profile.monthlyFixedCosts > 0) {
    switch (profile.fixedCostAllocation) {
      case FixedCostAllocation.perHour:
        if (profile.monthlyWorkingHours <= 0) {
          profileItems.add(l10n.monthlyHoursLabel);
        }
        break;
      case FixedCostAllocation.perKm:
        if (profile.monthlyDistanceKm <= 0) {
          profileItems.add(l10n.monthlyDistanceLabel);
        }
        break;
      case FixedCostAllocation.perDelivery:
        if (profile.monthlyDeliveries <= 0) {
          profileItems.add(l10n.monthlyDeliveriesLabel);
        }
        break;
    }
  }

  final vehicleItems = <String>[];
  if (vehicle.energyType != EnergyType.none) {
    if (vehicle.energyConsumptionPer100Km <= 0) {
      vehicleItems.add(l10n.consumptionLabel);
    }
    if (vehicle.energyPricePerUnit <= 0) {
      vehicleItems.add(l10n.energyPriceLabel);
    }
  }

  final sections = <MissingDataSection>[];
  if (profileItems.isNotEmpty) {
    sections.add(
      MissingDataSection(title: l10n.profileSectionTitle, items: profileItems),
    );
  }
  if (vehicleItems.isNotEmpty) {
    sections.add(
      MissingDataSection(title: l10n.vehiclesSectionTitle, items: vehicleItems),
    );
  }
  return sections;
}
