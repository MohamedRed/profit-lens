import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/place_selection.dart';
import 'offer_address_fields.dart';
import '../offer_flow_keys.dart';

class OfferDetailsFormFields extends StatelessWidget {
  final TextEditingController payoutController;
  final TextEditingController pickupNameController;
  final TextEditingController pickupAddressController;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final TextEditingController dropoffNameController;
  final TextEditingController dropoffAddressController;
  final ValueChanged<PlaceSelection>? onDropoffSelected;

  const OfferDetailsFormFields({
    super.key,
    required this.payoutController,
    required this.pickupNameController,
    required this.pickupAddressController,
    required this.onPickupSelected,
    required this.dropoffNameController,
    required this.dropoffAddressController,
    required this.onDropoffSelected,
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
        OfferAddressFields(
          pickupNameController: pickupNameController,
          pickupAddressController: pickupAddressController,
          onPickupSelected: onPickupSelected,
          dropoffNameController: dropoffNameController,
          dropoffAddressController: dropoffAddressController,
          onDropoffSelected: onDropoffSelected,
        ),
      ],
    );
  }
}
