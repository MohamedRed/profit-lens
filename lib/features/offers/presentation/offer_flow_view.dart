import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/offer_record.dart';
import '../domain/place_selection.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_form.dart';
import 'offer_flow_loading_action.dart';
import 'sections/vehicle_picker_header.dart';

class OfferFlowView extends StatelessWidget {
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
  final OfferFlowLoadingAction? loadingAction;
  final OfferRecord? previewRecord;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final ValueChanged<PlaceSelection>? onDropoffSelected;

  const OfferFlowView({
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
    required this.loadingAction,
    required this.previewRecord,
    required this.onPickupSelected,
    required this.onDropoffSelected,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      body: SafeArea(
        child: vehicles.isEmpty
            ? Center(child: Text(l10n.noVehiclesMessage))
            : Form(
                key: formKey,
                child: Column(
                  children: [
                    VehiclePickerHeader(
                      vehicles: vehicles,
                      selectedVehicleId: selectedVehicleId,
                      onChanged: onVehicleChanged,
                    ),
                    Expanded(
                      child: OfferFlowForm(
                        controller: controller,
                        requiresDuration: requiresDuration,
                        onImportScreenshot: onImportScreenshot,
                        onCaptureScreenshot: onCaptureScreenshot,
                        onViewDetails: onViewDetails,
                        loadingAction: loadingAction,
                        previewRecord: previewRecord,
                        onPickupSelected: onPickupSelected,
                        onDropoffSelected: onDropoffSelected,
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}
