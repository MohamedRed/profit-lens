import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_form.dart';

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
  final VoidCallback onAnalyze;
  final VoidCallback onSignOut;
  final bool isLoading;

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
    required this.onAnalyze,
    required this.onSignOut,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.offerTabLabel),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: onSignOut,
          ),
        ],
      ),
      body: SafeArea(
        child: vehicles.isEmpty
            ? Center(child: Text(l10n.noVehiclesMessage))
            : OfferFlowForm(
                formKey: formKey,
                controller: controller,
                requiresDuration: requiresDuration,
                vehicles: vehicles,
                selectedVehicleId: selectedVehicleId,
                onVehicleChanged: onVehicleChanged,
                onImportScreenshot: onImportScreenshot,
                onCaptureScreenshot: onCaptureScreenshot,
                onAnalyze: onAnalyze,
                isLoading: isLoading,
                extraction: controller.extraction,
              ),
      ),
    );
  }
}
