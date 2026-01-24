import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../features/profitability/domain/cost_breakdown.dart';
import '../../../features/profitability/domain/cost_settings.dart';
import '../../../features/profitability/domain/profitability_input.dart';
import '../../../l10n/app_localizations.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_record.dart';
import 'controllers/offer_flow_controller.dart';

OfferRecord? analyzeOffer({
  required BuildContext context,
  required OfferFlowController controller,
  required UserProfile profile,
  required VehicleProfile vehicle,
}) {
  final offer = controller.buildOffer();
  if (offer == null) {
    return null;
  }
  final costs = CostSettings(
    socialContributionRate: profile.socialContributionRate,
    incomeTaxRate: profile.incomeTaxRate,
    fixedCostAllocation: profile.fixedCostAllocation,
    monthlyFixedCosts: profile.monthlyFixedCosts,
    monthlyWorkingHours: profile.monthlyWorkingHours,
    monthlyDistanceKm: profile.monthlyDistanceKm,
    monthlyDeliveries: profile.monthlyDeliveries,
  );
  final input = ProfitabilityInput(
    offer: offer,
    vehicle: vehicle,
    costs: costs,
  );
  late final CostBreakdown breakdown;
  try {
    breakdown = AppScope.of(context).profitabilityEngine.evaluate(input);
  } catch (_) {
    final l10n = AppLocalizations.of(context)!;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.profitabilityFailedMessage)),
    );
    return null;
  }
  return OfferRecord(
    id: '',
    offer: offer,
    source: controller.source,
    createdAt: DateTime.now(),
    vehicleSnapshot: vehicle,
    costSnapshot: costs,
    breakdown: breakdown,
    extraction: controller.extraction,
  );
}
