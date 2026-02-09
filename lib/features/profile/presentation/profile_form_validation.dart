import '../../../l10n/app_localizations.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import 'profile_form_values.dart';

String? validateFixedCosts({
  required FixedCostAllocation allocation,
  required BusinessProfileValues values,
  required AppLocalizations l10n,
}) {
  if (values.monthlyFixedCosts <= 0) {
    return null;
  }
  switch (allocation) {
    case FixedCostAllocation.perHour:
      return values.monthlyHours <= 0 ? l10n.monthlyHoursRequiredError : null;
    case FixedCostAllocation.perKm:
      return values.monthlyDistance <= 0
          ? l10n.monthlyDistanceRequiredError
          : null;
    case FixedCostAllocation.perDelivery:
      return values.monthlyDeliveries <= 0
          ? l10n.monthlyDeliveriesRequiredError
          : null;
  }
}
