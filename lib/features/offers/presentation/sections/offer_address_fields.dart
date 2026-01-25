import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/place_selection.dart';
import '../widgets/place_autocomplete_field.dart';

class OfferAddressFields extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        TextFormField(
          controller: pickupNameController,
          decoration: InputDecoration(labelText: l10n.pickupNameLabel),
        ),
        const SizedBox(height: 12),
        PlaceAutocompleteField(
          controller: pickupAddressController,
          label: l10n.pickupAddressLabel,
          onSelected: onPickupSelected,
        ),
        AnimatedBuilder(
          animation: Listenable.merge([
            pickupAddressController,
            dropoffAddressController,
          ]),
          builder: (context, _) {
            final pickupEmpty = pickupAddressController.text.trim().isEmpty;
            final dropoffFilled = dropoffAddressController.text.trim().isNotEmpty;
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
        PlaceAutocompleteField(
          controller: dropoffAddressController,
          label: l10n.dropoffAddressLabel,
          onSelected: onDropoffSelected,
        ),
      ],
    );
  }
}
