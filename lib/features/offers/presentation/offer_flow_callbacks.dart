import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/app_scope.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'controllers/offer_flow_controller.dart';
import '../domain/offer_source.dart';
import 'offer_flow_actions.dart';
import 'offer_flow_import.dart';
import 'offer_analysis_status.dart';
import 'offer_result_screen.dart';
import 'offer_flow_loading_action.dart';

class OfferFlowCallbacks {
  final VoidCallback onImportScreenshot;
  final VoidCallback onCaptureScreenshot;
  final VoidCallback onViewDetails;

  const OfferFlowCallbacks({
    required this.onImportScreenshot,
    required this.onCaptureScreenshot,
    required this.onViewDetails,
  });
}

OfferFlowCallbacks buildOfferFlowCallbacks({
  required BuildContext context,
  required GlobalKey<FormState> formKey,
  required OfferFlowController controller,
  required UserProfile profile,
  required AuthUser user,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
  required ValueChanged<OfferFlowLoadingAction?> onLoadingChanged,
  required VoidCallback onUpdated,
}) {
  return OfferFlowCallbacks(
    onImportScreenshot: () => importOfferScreenshot(
      context: context,
      source: ImageSource.gallery,
      picker: AppScope.of(context).offerImagePickerService,
      controller: controller,
      vehicles: vehicles,
      selectedVehicleId: selectedVehicleId,
      onLoadingChanged: onLoadingChanged,
      loadingAction: OfferFlowLoadingAction.importScreenshot,
      onUpdated: onUpdated,
    ),
    onCaptureScreenshot: () => importOfferScreenshot(
      context: context,
      source: ImageSource.camera,
      picker: AppScope.of(context).offerImagePickerService,
      controller: controller,
      vehicles: vehicles,
      selectedVehicleId: selectedVehicleId,
      onLoadingChanged: onLoadingChanged,
      loadingAction: OfferFlowLoadingAction.captureScreenshot,
      onUpdated: onUpdated,
    ),
    onViewDetails: () async {
      if (controller.analysisRecord == null) {
        controller.source = OfferSource.manual;
      }
      final record = controller.analysisRecord;
      if (record != null &&
          controller.analysisStatus == OfferAnalysisStatus.completed) {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => OfferResultScreen(
              user: user,
              record: record,
            ),
          ),
        );
        return;
      }
      await handleOfferAnalysis(
        context: context,
        formKey: formKey,
        controller: controller,
        profile: profile,
        user: user,
        vehicles: vehicles,
        selectedVehicleId: selectedVehicleId,
        onLoadingChanged: onLoadingChanged,
        onUpdated: onUpdated,
      );
    },
  );
}
