import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../data/offer_image_picker_service.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_source.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_analysis_status.dart';
import 'offer_flow_error_message.dart';
import 'offer_flow_loading_action.dart';
import 'offer_flow_analysis_progress.dart';

Future<void> importOfferScreenshot({
  required BuildContext context,
  required ImageSource source,
  required OfferImagePickerService picker,
  required OfferFlowController controller,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
  required ValueChanged<OfferFlowLoadingAction?> onLoadingChanged,
  required OfferFlowLoadingAction loadingAction,
  required VoidCallback onUpdated,
}) async {
  final l10n = AppLocalizations.of(context)!;
  final image = await picker.pickImage(source: source);
  if (image == null) {
    return;
  }
  if (!context.mounted) {
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
  onLoadingChanged(loadingAction);
  if (!context.mounted || !controller.isCurrentAnalysis(runId)) {
    return;
  }
  try {
    if (vehicles.isNotEmpty) {
      final vehicle = vehicles.firstWhere(
        (item) => item.id == selectedVehicleId,
        orElse: () => vehicles.first,
      );
      final record = await AppScope.of(context).offerAnalysisService.analyzeOffer(
        image: image,
        vehicleId: vehicle.id,
        source: OfferSource.screenshot,
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
      onUpdated();
    } else {
      if (controller.isCurrentAnalysis(runId)) {
        controller.setAnalysisStatus(
          OfferAnalysisStatus.failed,
          errorMessage: l10n.analysisFailedBody,
        );
        onUpdated();
      }
    }
  } catch (error) {
    if (!context.mounted) return;
    if (controller.isCurrentAnalysis(runId)) {
      controller.setAnalysisStatus(
        OfferAnalysisStatus.failed,
        errorMessage: resolveAnalysisErrorMessage(error, l10n),
      );
      onUpdated();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(resolveAnalysisErrorMessage(error, l10n))),
      );
    }
  } finally {
    if (context.mounted && controller.isCurrentAnalysis(runId)) {
      onLoadingChanged(null);
    }
  }
}
