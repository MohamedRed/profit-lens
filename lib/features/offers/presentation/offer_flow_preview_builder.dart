import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_record.dart';
import 'controllers/offer_flow_controller.dart';
import 'missing_data/missing_data_builder.dart';
import 'offer_flow_analysis.dart';

OfferRecord? buildOfferPreview({
  required BuildContext context,
  required OfferFlowController controller,
  required UserProfile profile,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
}) {
  if (vehicles.isEmpty) {
    return null;
  }
  final vehicle = vehicles.firstWhere(
    (item) => item.id == selectedVehicleId,
    orElse: () => vehicles.first,
  );
  final offer = controller.buildOffer();
  if (offer == null) {
    return null;
  }
  final requiresDuration =
      profile.fixedCostAllocation == FixedCostAllocation.perHour;
  if (requiresDuration && (offer.durationMinutes == null || offer.durationMinutes! <= 0)) {
    return null;
  }
  final l10n = AppLocalizations.of(context)!;
  final missingSections = buildMissingDataSections(
    l10n: l10n,
    profile: profile,
    vehicle: vehicle,
  );
  if (missingSections.isNotEmpty) {
    return null;
  }
  return previewOffer(
    context: context,
    controller: controller,
    profile: profile,
    vehicle: vehicle,
  );
}
