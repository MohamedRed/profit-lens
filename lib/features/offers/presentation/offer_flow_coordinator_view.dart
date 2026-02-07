import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_record.dart';
import '../domain/place_selection.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_view.dart';
import 'offer_flow_loading_action.dart';

class OfferFlowCoordinatorView extends StatelessWidget {
  final AuthUser user;
  final GlobalKey<FormState> formKey;
  final OfferFlowController controller;
  final bool requiresDuration;
  final List<VehicleProfile> vehicles;
  final String? selectedVehicleId;
  final ValueChanged<String?> onVehicleChanged;
  final VoidCallback onImportScreenshot;
  final VoidCallback onCaptureScreenshot;
  final VoidCallback onEnterManually;
  final VoidCallback onAnalyzeManual;
  final VoidCallback onViewDetails;
  final OfferFlowLoadingAction? loadingAction;
  final OfferRecord? previewRecord;
  final bool isManualEntryRequested;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final ValueChanged<PlaceSelection>? onDropoffSelected;
  final double minProfitabilityEuro;
  final ValueChanged<double> onMinProfitabilityChanged;

  const OfferFlowCoordinatorView({
    super.key,
    required this.user,
    required this.formKey,
    required this.controller,
    required this.requiresDuration,
    required this.vehicles,
    required this.selectedVehicleId,
    required this.onVehicleChanged,
    required this.onImportScreenshot,
    required this.onCaptureScreenshot,
    required this.onEnterManually,
    required this.onAnalyzeManual,
    required this.onViewDetails,
    required this.loadingAction,
    required this.previewRecord,
    required this.isManualEntryRequested,
    required this.onPickupSelected,
    required this.onDropoffSelected,
    required this.minProfitabilityEuro,
    required this.onMinProfitabilityChanged,
  });

  @override
  Widget build(BuildContext context) {
    return OfferFlowView(
      user: user,
      formKey: formKey,
      controller: controller,
      requiresDuration: requiresDuration,
      vehicles: vehicles,
      selectedVehicleId: selectedVehicleId,
      onVehicleChanged: onVehicleChanged,
      onImportScreenshot: onImportScreenshot,
      onCaptureScreenshot: onCaptureScreenshot,
      onEnterManually: onEnterManually,
      onAnalyzeManual: onAnalyzeManual,
      onViewDetails: onViewDetails,
      loadingAction: loadingAction,
      previewRecord: previewRecord,
      isManualEntryRequested: isManualEntryRequested,
      onPickupSelected: onPickupSelected,
      onDropoffSelected: onDropoffSelected,
      minProfitabilityEuro: minProfitabilityEuro,
      onMinProfitabilityChanged: onMinProfitabilityChanged,
    );
  }
}
