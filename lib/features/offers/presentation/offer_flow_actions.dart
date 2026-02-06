import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_record.dart';
import '../presentation/offer_result_screen.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_error_message.dart';
import 'offer_flow_guard.dart';
import 'offer_flow_analysis_progress.dart';
import 'offer_analysis_status.dart';
import 'offer_flow_loading_action.dart';

Future<void> handleOfferAnalysis({
  required BuildContext context,
  required GlobalKey<FormState> formKey,
  required OfferFlowController controller,
  required UserProfile profile,
  required AuthUser user,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
  required ValueChanged<OfferFlowLoadingAction?> onLoadingChanged,
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
  final runId = controller.startAnalysis(OfferAnalysisStatus.extracting);
  final progress = OfferAnalysisProgressDriver.start(
    controller: controller,
    runId: runId,
    onUpdated: onUpdated,
    steps: const [
      OfferAnalysisStatus.extracting,
      OfferAnalysisStatus.verifyingRoute,
      OfferAnalysisStatus.calculatingProfit,
    ],
    stepDurations: const [
      Duration(milliseconds: 900),
      Duration(milliseconds: 800),
      Duration(milliseconds: 500),
    ],
  );
  onUpdated();
  onLoadingChanged(OfferFlowLoadingAction.analyze);
  if (!context.mounted) {
    return;
  }
  final offer = controller.buildOffer();
  if (offer == null) {
    if (controller.isCurrentAnalysis(runId)) {
      controller.setAnalysisStatus(
        OfferAnalysisStatus.failed,
        errorMessage: l10n.analysisFailedBody,
      );
      onLoadingChanged(null);
      onUpdated();
    }
    return;
  }
  OfferRecord? record;
  try {
    record = await AppScope.of(context).offerAnalysisService.analyzeOffer(
      offer: offer,
      vehicleId: vehicle.id,
      source: controller.source,
    );
    if (!controller.isCurrentAnalysis(runId)) {
      return;
    }
    controller.applyAnalysisResult(record);
    await progress.waitForMinimumDuration();
    if (!controller.isCurrentAnalysis(runId)) {
      return;
    }
    controller.setAnalysisStatus(OfferAnalysisStatus.completed);
  } catch (error) {
    final message = resolveAnalysisErrorMessage(error, l10n);
    if (context.mounted && controller.isCurrentAnalysis(runId)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(message)),
      );
    }
    if (controller.isCurrentAnalysis(runId)) {
      controller.setAnalysisStatus(
        OfferAnalysisStatus.failed,
        errorMessage: message,
      );
      onLoadingChanged(null);
      onUpdated();
    }
    return;
  }
  if (controller.isCurrentAnalysis(runId)) {
    onLoadingChanged(null);
    onUpdated();
  }
  if (!context.mounted) {
    return;
  }
  if (!controller.isCurrentAnalysis(runId)) {
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
