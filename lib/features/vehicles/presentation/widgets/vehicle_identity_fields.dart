import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_brand_autocomplete_field.dart';
import 'vehicle_model_autocomplete_field.dart';

class VehicleIdentityFields extends StatelessWidget {
  final VehicleType vehicleType;
  final TextEditingController brandController;
  final TextEditingController modelController;
  final VoidCallback? onModelLookup;

  const VehicleIdentityFields({
    super.key,
    required this.vehicleType,
    required this.brandController,
    required this.modelController,
    required this.onModelLookup,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        VehicleBrandAutocompleteField(
          vehicleType: vehicleType,
          controller: brandController,
          onFocusLost: onModelLookup,
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        VehicleModelAutocompleteField(
          vehicleType: vehicleType,
          brandController: brandController,
          controller: modelController,
          onEditingComplete: onModelLookup,
          onFocusLost: onModelLookup,
          onSelected: (_) => onModelLookup?.call(),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
      ],
    );
  }
}
