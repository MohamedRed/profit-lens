import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/app_scope.dart';
import '../data/offer_image_picker_service.dart';
import '../../../l10n/app_localizations.dart';
import 'controllers/offer_flow_controller.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'offer_flow_route_verification.dart';
import 'offer_analysis_status.dart';

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
  final image = await picker.pickImage(source: source);
  if (image == null) {
    return;
  }
  if (!context.mounted) {
    return;
  }
  final l10n = AppLocalizations.of(context)!;
  controller.clearAnalysis();
  controller.setAnalysisStatus(OfferAnalysisStatus.extracting);
  onUpdated();
  onLoadingChanged(true);
  try {
    final result = await AppScope.of(context)
        .offerIngestionService
        .extractFromImage(image);
    if (!context.mounted) {
      return;
    }
    controller.applyExtraction(result);
    onUpdated();
    controller.setAnalysisStatus(OfferAnalysisStatus.verifyingRoute);
    onUpdated();
    if (vehicles.isNotEmpty) {
      final vehicle = vehicles.firstWhere(
        (item) => item.id == selectedVehicleId,
        orElse: () => vehicles.first,
      );
      final verification = await verifyOfferRoute(
        context: context,
        controller: controller,
        vehicle: vehicle,
      );
      if (verification == null) {
        controller.setAnalysisStatus(
          OfferAnalysisStatus.failed,
          errorMessage: l10n.analysisFailedBody,
        );
        onUpdated();
        return;
      }
      if (!context.mounted) {
        return;
      }
      controller.applyRouteVerification(verification);
      onUpdated();
      controller.setAnalysisStatus(OfferAnalysisStatus.calculatingProfit);
      onUpdated();
      final offer = controller.buildOffer();
      if (offer == null) {
        controller.setAnalysisStatus(
          OfferAnalysisStatus.failed,
          errorMessage: l10n.analysisFailedBody,
        );
        onUpdated();
        return;
      }
      final record = await AppScope.of(context).offerAnalysisService.analyzeOffer(
        offer: offer,
        routeVerification: verification,
        vehicleId: vehicle.id,
        source: controller.source,
        extraction: controller.extraction,
      );
      controller.applyAnalysisRecord(record);
      controller.setAnalysisStatus(OfferAnalysisStatus.completed);
      onUpdated();
    } else {
      controller.setAnalysisStatus(
        OfferAnalysisStatus.failed,
        errorMessage: l10n.analysisFailedBody,
      );
      onUpdated();
    }
  } catch (_) {
    if (!context.mounted) return;
    controller.setAnalysisStatus(
      OfferAnalysisStatus.failed,
      errorMessage: l10n.analysisFailedBody,
    );
    onUpdated();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.analysisFailedBody)),
    );
  } finally {
    if (context.mounted) {
      onLoadingChanged(false);
    }
  }
}
