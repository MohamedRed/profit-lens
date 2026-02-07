import 'package:flutter/material.dart';

import '../../../core/widgets/primary_button.dart';
import '../../../l10n/app_localizations.dart';
import '../domain/offer_record.dart';
import '../domain/place_selection.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'controllers/offer_flow_controller.dart';
import 'sections/offer_details_section.dart';
import 'sections/vehicle_picker_section.dart';
import 'widgets/profitability_overview_card.dart';
import 'offer_flow_keys.dart';
import 'offer_flow_loading_action.dart';
import 'offer_analysis_status.dart';

class OfferFlowForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final List<VehicleProfile> vehicles;
  final String? selectedVehicleId;
  final ValueChanged<String?> onVehicleChanged;
  final OfferFlowController controller;
  final bool requiresDuration;
  final VoidCallback onImportScreenshot;
  final VoidCallback onCaptureScreenshot;
  final VoidCallback onEnterManually;
  final VoidCallback onViewDetails;
  final OfferFlowLoadingAction? loadingAction;
  final OfferRecord? previewRecord;
  final bool isManualEntryRequested;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final ValueChanged<PlaceSelection>? onDropoffSelected;
  final double minProfitabilityEuro;

  const OfferFlowForm({
    super.key,
    required this.formKey,
    required this.vehicles,
    required this.selectedVehicleId,
    required this.onVehicleChanged,
    required this.controller,
    required this.requiresDuration,
    required this.onImportScreenshot,
    required this.onCaptureScreenshot,
    required this.onEnterManually,
    required this.onViewDetails,
    required this.loadingAction,
    required this.previewRecord,
    required this.isManualEntryRequested,
    required this.onPickupSelected,
    required this.onDropoffSelected,
    required this.minProfitabilityEuro,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isBusy = loadingAction != null;
    final showOverview =
        !isBusy &&
        previewRecord != null &&
        controller.analysisStatus == OfferAnalysisStatus.completed;
    final showDetailsSection =
        !showOverview &&
        (isManualEntryRequested ||
            controller.analysisStatus != OfferAnalysisStatus.idle);
    final showManualEntryCta = !showOverview && !showDetailsSection;
    return Form(
      key: formKey,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        children: [
          VehiclePickerSection(
            vehicles: vehicles,
            selectedVehicleId: selectedVehicleId,
            onChanged: onVehicleChanged,
          ),
          const SizedBox(height: 16),
          PrimaryButton(
            key: OfferFlowKeys.importScreenshotButton,
            label: l10n.importScreenshotButton,
            icon: Icons.upload_file,
            onPressed: isBusy ? null : onImportScreenshot,
          ),
          const SizedBox(height: 12),
          PrimaryButton(
            key: OfferFlowKeys.captureScreenshotButton,
            label: l10n.captureScreenshotButton,
            icon: Icons.photo_camera_outlined,
            onPressed: isBusy ? null : onCaptureScreenshot,
          ),
          if (showManualEntryCta) ...[
            const SizedBox(height: 12),
            PrimaryButton(
              key: OfferFlowKeys.manualEntryButton,
              label: l10n.manualEntryButton,
              icon: Icons.edit,
              onPressed: isBusy ? null : onEnterManually,
            ),
          ],
          const SizedBox(height: 16),
          if (showOverview) ...[
            ProfitabilityDecisionCard(
              record: previewRecord!,
              minProfitabilityEuro: minProfitabilityEuro,
            ),
            const SizedBox(height: 12),
            ProfitabilityOverviewCard(
              record: previewRecord!,
              minProfitabilityEuro: minProfitabilityEuro,
              onViewDetails: onViewDetails,
            ),
          ],
          if (showDetailsSection) ...[
            const SizedBox(height: 16),
            OfferDetailsSection(
              controller: controller,
              requiresDuration: requiresDuration,
              onPickupSelected: onPickupSelected,
              onDropoffSelected: onDropoffSelected,
            ),
          ],
        ],
      ),
    );
  }
}
