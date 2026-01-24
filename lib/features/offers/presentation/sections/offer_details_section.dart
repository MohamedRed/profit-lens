import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_extraction_metadata.dart';
import '../../domain/place_selection.dart';
import '../controllers/offer_flow_controller.dart';
import 'offer_extraction_summary.dart';
import 'offer_details_form_fields.dart';
import 'offer_details_summary.dart';

class OfferDetailsSection extends StatefulWidget {
  final OfferFlowController controller;
  final bool requiresDuration;
  final bool hasExtraction;
  final OfferExtractionMetadata? extraction;
  final ValueChanged<PlaceSelection>? onPickupSelected;

  const OfferDetailsSection({
    super.key,
    required this.controller,
    required this.requiresDuration,
    required this.hasExtraction,
    required this.extraction,
    required this.onPickupSelected,
  });

  @override
  State<OfferDetailsSection> createState() => _OfferDetailsSectionState();
}

class _OfferDetailsSectionState extends State<OfferDetailsSection> {
  bool _showOptional = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final hasPayout = widget.controller.payoutController.text.trim().isNotEmpty;
    final hasDistance =
        widget.controller.distanceController.text.trim().isNotEmpty;
    final hasDuration =
        widget.controller.durationController.text.trim().isNotEmpty;
    final hasRequired = hasPayout &&
        hasDistance &&
        (!widget.requiresDuration || hasDuration);
    if (widget.hasExtraction && hasRequired && !_showOptional) {
      return OfferDetailsSummary(
        controller: widget.controller,
        onEdit: () => setState(() => _showOptional = true),
        extraction: widget.extraction,
      );
    }
    return SectionCard(
      title: l10n.offerDetailsSection,
      children: [
        OfferDetailsFormFields(
          payoutController: widget.controller.payoutController,
          distanceController: widget.controller.distanceController,
          durationController: widget.controller.durationController,
          pickupNameController: widget.controller.pickupNameController,
          pickupAddressController: widget.controller.pickupAddressController,
          onPickupSelected: widget.onPickupSelected,
          showDuration: widget.requiresDuration || _showOptional,
          showPickupFields: _showOptional,
          requiresDuration: widget.requiresDuration,
        ),
        if (widget.extraction != null)
          OfferExtractionSummary(metadata: widget.extraction!),
        const SizedBox(height: 8),
        TextButton(
          onPressed: () => setState(() => _showOptional = !_showOptional),
          child: Text(
            _showOptional
                ? l10n.hideOptionalDetailsButton
                : l10n.addOptionalDetailsButton,
          ),
        ),
      ],
    );
  }
}
