import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../presentation/offer_result_screen.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_analysis.dart';
import 'offer_flow_guard.dart';
import 'offer_flow_route_verification.dart';

Future<void> handleOfferAnalysis({
  required BuildContext context,
  required GlobalKey<FormState> formKey,
  required OfferFlowController controller,
  required UserProfile profile,
  required AuthUser user,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
  required ValueChanged<bool> onLoadingChanged,
}) async {
  if (!(formKey.currentState?.validate() ?? false)) {
    return;
  }
  final vehicle = vehicles.firstWhere(
    (item) => item.id == selectedVehicleId,
    orElse: () => vehicles.first,
  );
  final ready = await ensureOfferReady(
    context: context,
    user: user,
    profile: profile,
    vehicle: vehicle,
  );
  if (!context.mounted) {
    return;
  }
  if (!ready) {
    return;
  }
  onLoadingChanged(true);
  final verification = await verifyOfferRoute(
    context: context,
    controller: controller,
    vehicle: vehicle,
  );
  if (verification == null) {
    onLoadingChanged(false);
    return;
  }
  controller.applyRouteVerification(verification);
  final record = analyzeOffer(
    context: context,
    controller: controller,
    profile: profile,
    vehicle: vehicle,
  );
  if (record == null) {
    onLoadingChanged(false);
    return;
  }
  try {
    await AppScope.of(context).offerRepository.saveOffer(user.uid, record);
  } catch (_) {
    if (context.mounted) {
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.offerSaveFailedMessage)),
      );
    }
  }
  onLoadingChanged(false);
  if (!context.mounted) {
    return;
  }
  Navigator.of(context).push(
    MaterialPageRoute(
      builder: (context) => OfferResultScreen(
        user: user,
        record: record,
      ),
    ),
  );
}
