import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_record.dart';
import '../domain/place_selection.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_view.dart';

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
  final VoidCallback onViewDetails;
  final VoidCallback onSignOut;
  final bool isLoading;
  final OfferRecord? previewRecord;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final ValueChanged<PlaceSelection>? onDropoffSelected;

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
    required this.onViewDetails,
    required this.onSignOut,
    required this.isLoading,
    required this.previewRecord,
    required this.onPickupSelected,
    required this.onDropoffSelected,
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
      onViewDetails: onViewDetails,
      onSignOut: onSignOut,
      isLoading: isLoading,
      previewRecord: previewRecord,
      onPickupSelected: onPickupSelected,
      onDropoffSelected: onDropoffSelected,
    );
  }
}
