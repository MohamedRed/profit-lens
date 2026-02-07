import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/place_selection.dart';
import '../controllers/offer_flow_controller.dart';
import '../offer_analysis_status.dart';
import 'offer_analysis_progress_card.dart';
import 'offer_details_form_fields.dart';
import 'offer_details_summary.dart';

class OfferDetailsSection extends StatefulWidget {
  final OfferFlowController controller;
  final bool requiresDuration;
  final bool showAllAddressFields;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final ValueChanged<PlaceSelection>? onDropoffSelected;

  const OfferDetailsSection({
    super.key,
    required this.controller,
    required this.requiresDuration,
    required this.showAllAddressFields,
    required this.onPickupSelected,
    required this.onDropoffSelected,
  });

  @override
  State<OfferDetailsSection> createState() => _OfferDetailsSectionState();
}

class _OfferDetailsSectionState extends State<OfferDetailsSection> {
  bool _isEditing = false;
  OfferAnalysisStatus? _lastStatus;

  void _syncEditingState(OfferAnalysisStatus status, bool hasRequired) {
    if (_lastStatus == status) {
      return;
    }
    _lastStatus = status;
    if (status == OfferAnalysisStatus.completed && hasRequired) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() => _isEditing = false);
        }
      });
    }
  }

  void _resetOffer() {
    widget.controller.resetOfferDetails();
    setState(() => _isEditing = true);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final hasPayout = widget.controller.payoutController.text.trim().isNotEmpty;
    final hasPickup = widget.controller.pickupAddressController.text
        .trim()
        .isNotEmpty;
    final hasDropoff = widget.controller.dropoffAddressController.text
        .trim()
        .isNotEmpty;
    final hasDistance =
        widget.controller.distanceController.text.trim().isNotEmpty ||
        widget.controller.routeVerification != null;
    final hasDuration =
        widget.controller.durationController.text.trim().isNotEmpty ||
        widget.controller.routeVerification != null;
    final hasRequired =
        hasPayout &&
        hasPickup &&
        hasDropoff &&
        hasDistance &&
        (!widget.requiresDuration || hasDuration);
    final analysisStatus = widget.controller.analysisStatus;
    _syncEditingState(analysisStatus, hasRequired);
    if (analysisStatus.isAnalyzing) {
      return OfferAnalysisProgressCard(
        status: analysisStatus,
        errorMessage: widget.controller.analysisErrorMessage,
        onEdit: () => setState(() => _isEditing = true),
      );
    }
    if (analysisStatus == OfferAnalysisStatus.failed) {
      return OfferAnalysisProgressCard(
        status: analysisStatus,
        errorMessage: widget.controller.analysisErrorMessage,
        onEdit: () => setState(() => _isEditing = true),
      );
    }
    if (analysisStatus == OfferAnalysisStatus.completed &&
        hasRequired &&
        !_isEditing) {
      return OfferDetailsSummary(
        controller: widget.controller,
        onEdit: () => setState(() => _isEditing = true),
        onReset: _resetOffer,
      );
    }
    return SectionCard(
      title: l10n.offerDetailsSection,
      children: [
        OfferDetailsFormFields(
          payoutController: widget.controller.payoutController,
          showAllAddressFields: widget.showAllAddressFields,
          pickupNameController: widget.controller.pickupNameController,
          pickupAddressController: widget.controller.pickupAddressController,
          dropoffNameController: widget.controller.dropoffNameController,
          dropoffAddressController: widget.controller.dropoffAddressController,
          onPickupSelected: widget.onPickupSelected,
          onDropoffSelected: widget.onDropoffSelected,
        ),
      ],
    );
  }
}
