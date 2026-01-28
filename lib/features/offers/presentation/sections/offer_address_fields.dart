import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/place_selection.dart';
import '../widgets/place_autocomplete_field.dart';

class OfferAddressFields extends StatefulWidget {
  final TextEditingController pickupNameController;
  final TextEditingController pickupAddressController;
  final ValueChanged<PlaceSelection>? onPickupSelected;
  final TextEditingController dropoffAddressController;
  final ValueChanged<PlaceSelection>? onDropoffSelected;

  const OfferAddressFields({
    super.key,
    required this.pickupNameController,
    required this.pickupAddressController,
    required this.onPickupSelected,
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
    return Column(
      children: [
        if (!hidePickup) ...[
          TextFormField(
            controller: widget.pickupNameController,
            decoration: InputDecoration(labelText: l10n.pickupNameLabel),
          ),
          const SizedBox(height: 12),
          PlaceAutocompleteField(
            controller: widget.pickupAddressController,
            label: l10n.pickupAddressLabel,
            onSelected: widget.onPickupSelected,
            onDropdownOpenChanged: (isOpen) {
              if (mounted) {
                setState(() => _pickupDropdownOpen = isOpen);
              }
            },
          ),
        ],
        AnimatedBuilder(
          animation: Listenable.merge([
            widget.pickupAddressController,
            widget.dropoffAddressController,
          ]),
          builder: (context, _) {
            final pickupEmpty =
                widget.pickupAddressController.text.trim().isEmpty;
            final dropoffFilled =
                widget.dropoffAddressController.text.trim().isNotEmpty;
            if (!pickupEmpty || !dropoffFilled) {
              return const SizedBox.shrink();
            }
            return Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.info_outline,
                    size: 16,
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      l10n.pickupAddressMissingHint,
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color:
                                Theme.of(context).colorScheme.onSurfaceVariant,
                          ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        const SizedBox(height: 12),
        if (!hideDropoff)
          PlaceAutocompleteField(
            controller: widget.dropoffAddressController,
            label: l10n.dropoffAddressLabel,
            onSelected: widget.onDropoffSelected,
            onDropdownOpenChanged: (isOpen) {
              if (mounted) {
                setState(() => _dropoffDropdownOpen = isOpen);
              }
            },
          ),
      ],
    );
  }
}
