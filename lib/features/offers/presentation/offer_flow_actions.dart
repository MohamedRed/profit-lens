import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_record.dart';
import '../presentation/offer_result_screen.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_guard.dart';
import 'offer_flow_route_verification.dart';
import 'offer_analysis_status.dart';

Future<void> handleOfferAnalysis({
  required BuildContext context,
  required GlobalKey<FormState> formKey,
  required OfferFlowController controller,
  required UserProfile profile,
  required AuthUser user,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
  required ValueChanged<bool> onLoadingChanged,
  required VoidCallback onUpdated,
}) async {
  if (!(formKey.currentState?.validate() ?? false)) {
    return;
  }
  final l10n = AppLocalizations.of(context)!;
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
  controller.clearAnalysis();
  controller.setAnalysisStatus(OfferAnalysisStatus.verifyingRoute);
  onUpdated();
  onLoadingChanged(true);
  final verification = await verifyOfferRoute(
    context: context,
    controller: controller,
    vehicle: vehicle,
  );
  if (verification == null) {
    onLoadingChanged(false);
    onUpdated();
    return;
  }
  if (!context.mounted) {
    return;
  }
  controller.applyRouteVerification(verification);
  controller.setAnalysisStatus(OfferAnalysisStatus.calculatingProfit);
  onUpdated();
  final offer = controller.buildOffer();
  if (offer == null) {
    onLoadingChanged(false);
    onUpdated();
    return;
  }
  OfferRecord? record;
  try {
    record = await AppScope.of(context).offerAnalysisService.analyzeOffer(
      offer: offer,
      routeVerification: verification,
      vehicleId: vehicle.id,
      source: controller.source,
      extraction: controller.extraction,
    );
    controller.applyAnalysisRecord(record);
    controller.setAnalysisStatus(OfferAnalysisStatus.completed);
  } catch (_) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.offerSaveFailedMessage)),
      );
    }
    controller.setAnalysisStatus(
      OfferAnalysisStatus.failed,
      errorMessage: l10n.analysisFailedBody,
    );
    onLoadingChanged(false);
    onUpdated();
    return;
  }
  onLoadingChanged(false);
  onUpdated();
  if (!context.mounted) {
    return;
  }
  Navigator.of(context).push(
    MaterialPageRoute(
      builder: (context) => OfferResultScreen(
        user: user,
        record: record!,
      ),
    ),
  );
}
