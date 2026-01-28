import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/place_selection.dart';
import 'offer_address_fields.dart';
import '../offer_flow_keys.dart';

class OfferDetailsFormFields extends StatelessWidget {
  final TextEditingController payoutController;
  final TextEditingController distanceController;
  final TextEditingController durationController;
  final TextEditingController pickupNameController;
  final TextEditingController pickupAddressController;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final TextEditingController dropoffNameController;
  final TextEditingController dropoffAddressController;
  final ValueChanged<PlaceSelection>? onDropoffSelected;
  final bool showDuration;
  final bool showPickupFields;
  final bool requiresDuration;

  const OfferDetailsFormFields({
    super.key,
    required this.payoutController,
    required this.distanceController,
    required this.durationController,
    required this.pickupNameController,
    required this.pickupAddressController,
    required this.onPickupSelected,
    required this.dropoffNameController,
    required this.dropoffAddressController,
    required this.onDropoffSelected,
    required this.showDuration,
    required this.showPickupFields,
    required this.requiresDuration,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        TextFormField(
          key: OfferFlowKeys.payoutField,
          controller: payoutController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.offerAmountLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        TextFormField(
          key: OfferFlowKeys.distanceField,
          controller: distanceController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.distanceKmLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
        if (showDuration) ...[
          const SizedBox(height: 12),
          TextFormField(
            key: OfferFlowKeys.durationField,
            controller: durationController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(labelText: l10n.durationMinutesLabel),
            validator: (value) {
              if (!requiresDuration) {
                return null;
              }
              if (value == null || value.trim().isEmpty) {
                return l10n.requiredFieldError;
              }
              return null;
            },
          ),
        ],
        if (showPickupFields) ...[
          const SizedBox(height: 12),
          OfferAddressFields(
            pickupNameController: pickupNameController,
            pickupAddressController: pickupAddressController,
            onPickupSelected: onPickupSelected,
            dropoffNameController: dropoffNameController,
            dropoffAddressController: dropoffAddressController,
            onDropoffSelected: onDropoffSelected,
          ),
        ],
      ],
    );
  }
}
