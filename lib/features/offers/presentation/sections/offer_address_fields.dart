import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/place_selection.dart';
import '../widgets/place_autocomplete_field.dart';
import '../offer_flow_keys.dart';

class OfferAddressFields extends StatefulWidget {
  final bool showAllFields;
  final TextEditingController pickupNameController;
  final TextEditingController pickupAddressController;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final TextEditingController dropoffNameController;
  final TextEditingController dropoffAddressController;
  final ValueChanged<PlaceSelection>? onDropoffSelected;

  const OfferAddressFields({
    super.key,
    required this.showAllFields,
    required this.pickupNameController,
    required this.pickupAddressController,
    required this.onPickupSelected,
    required this.dropoffNameController,
    required this.dropoffAddressController,
    required this.onDropoffSelected,
  });

  @override
  State<OfferAddressFields> createState() => _OfferAddressFieldsState();
}

class _OfferAddressFieldsState extends State<OfferAddressFields> {
  bool _pickupDropdownOpen = false;
  bool _dropoffDropdownOpen = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final hidePickup = _dropoffDropdownOpen;
    final hideDropoff = _pickupDropdownOpen;
    final showPickupName = widget.pickupNameController.text.trim().isNotEmpty;
    final showPickupAddress =
        widget.showAllFields ||
        widget.pickupAddressController.text.trim().isNotEmpty;
    final showDropoffName = widget.dropoffNameController.text.trim().isNotEmpty;
    return Column(
      children: [
        if (!hidePickup) ...[
          if (showPickupName) ...[
            TextFormField(
              key: OfferFlowKeys.pickupNameField,
              controller: widget.pickupNameController,
              decoration: InputDecoration(labelText: l10n.pickupNameLabel),
            ),
            if (showPickupAddress) const SizedBox(height: 12),
          ],
          if (showPickupAddress)
            PlaceAutocompleteField(
              key: OfferFlowKeys.pickupAddressField,
              controller: widget.pickupAddressController,
              label: l10n.pickupAddressLabel,
              placeholder: l10n.pickupAddressPlaceholder,
              onSelected: widget.onPickupSelected,
              onDropdownOpenChanged: (isOpen) {
                if (mounted) {
                  setState(() => _pickupDropdownOpen = isOpen);
                }
              },
            ),
        ],
        const SizedBox(height: 12),
        if (!hideDropoff) ...[
          if (showDropoffName) ...[
            TextFormField(
              key: OfferFlowKeys.dropoffNameField,
              controller: widget.dropoffNameController,
              decoration: InputDecoration(labelText: l10n.dropoffNameLabel),
            ),
            const SizedBox(height: 12),
          ],
          PlaceAutocompleteField(
            key: OfferFlowKeys.dropoffAddressField,
            controller: widget.dropoffAddressController,
            label: l10n.dropoffAddressLabel,
            placeholder: l10n.dropoffAddressPlaceholder,
            onSelected: widget.onDropoffSelected,
            onDropdownOpenChanged: (isOpen) {
              if (mounted) {
                setState(() => _dropoffDropdownOpen = isOpen);
              }
            },
          ),
        ],
      ],
    );
  }
}
