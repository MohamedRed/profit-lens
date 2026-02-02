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

Future<void> importOfferScreenshot({
  required BuildContext context,
  required ImageSource source,
  required OfferImagePickerService picker,
  required OfferFlowController controller,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
  required ValueChanged<bool> onLoadingChanged,
  required VoidCallback onUpdated,
}) async {
  final l10n = AppLocalizations.of(context)!;
  final runId = controller.startAnalysis(OfferAnalysisStatus.extracting);
  onUpdated();
  onLoadingChanged(true);
  final image = await picker.pickImage(source: source);
  if (image == null) {
    if (controller.isCurrentAnalysis(runId)) {
      controller.setAnalysisStatus(OfferAnalysisStatus.idle);
      onUpdated();
      onLoadingChanged(false);
    }
    return;
  }
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
      onLoadingChanged(false);
    }
  }
}
