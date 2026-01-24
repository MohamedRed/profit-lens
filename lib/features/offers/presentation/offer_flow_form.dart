import 'package:flutter/material.dart';

import '../../../core/widgets/primary_button.dart';
import '../../../l10n/app_localizations.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/offer_extraction_metadata.dart';
import 'controllers/offer_flow_controller.dart';
import 'sections/offer_details_section.dart';
import 'sections/vehicle_picker_section.dart';
import 'widgets/extraction_summary_card.dart';

class OfferFlowForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final OfferFlowController controller;
  final bool requiresDuration;
  final List<VehicleProfile> vehicles;
  final String? selectedVehicleId;
  final ValueChanged<String?> onVehicleChanged;
  final VoidCallback onImportScreenshot;
  final VoidCallback onCaptureScreenshot;
  final VoidCallback onAnalyze;
  final bool isLoading;
  final OfferExtractionMetadata? extraction;

  const OfferFlowForm({
    super.key,
    required this.formKey,
    required this.controller,
    required this.requiresDuration,
    required this.vehicles,
    required this.selectedVehicleId,
    required this.onVehicleChanged,
    required this.onImportScreenshot,
    required this.onCaptureScreenshot,
    required this.onAnalyze,
    required this.isLoading,
    required this.extraction,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Form(
      key: formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          OfferDetailsSection(
            controller: controller,
            requiresDuration: requiresDuration,
            hasExtraction: extraction != null,
          ),
          const SizedBox(height: 12),
          VehiclePickerSection(
            vehicles: vehicles,
            selectedVehicleId: selectedVehicleId,
            onChanged: onVehicleChanged,
          ),
          if (extraction != null) ...[
            const SizedBox(height: 12),
            ExtractionSummaryCard(metadata: extraction!),
          ],
          const SizedBox(height: 16),
          PrimaryButton(
            label: isLoading ? l10n.loadingLabel : l10n.importScreenshotButton,
            onPressed: isLoading ? null : onImportScreenshot,
          ),
          const SizedBox(height: 12),
          PrimaryButton(
            label: isLoading ? l10n.loadingLabel : l10n.captureScreenshotButton,
            onPressed: isLoading ? null : onCaptureScreenshot,
          ),
          const SizedBox(height: 12),
          PrimaryButton(
            label: l10n.analyzeButton,
            onPressed: vehicles.isEmpty ? null : onAnalyze,
          ),
        ],
      ),
    );
  }
}
