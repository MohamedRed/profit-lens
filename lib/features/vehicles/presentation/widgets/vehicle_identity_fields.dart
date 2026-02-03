import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_brand_autocomplete_field.dart';
import 'vehicle_license_plate_field.dart';
import 'vehicle_model_autocomplete_field.dart';

class VehicleIdentityFields extends StatelessWidget {
  final VehicleType vehicleType;
  final TextEditingController licensePlateController;
  final TextEditingController brandController;
  final TextEditingController modelController;
  final TextEditingController registrationYearController;
  final VoidCallback? onModelLookup;
  final VoidCallback? onPlateLookup;
  final bool isLookingUpPlate;

  const VehicleIdentityFields({
    super.key,
    required this.vehicleType,
    required this.licensePlateController,
    required this.brandController,
    required this.modelController,
    required this.registrationYearController,
    required this.onModelLookup,
    required this.onPlateLookup,
    required this.isLookingUpPlate,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        VehicleLicensePlateField(
          controller: licensePlateController,
          isLookupInProgress: isLookingUpPlate,
          onLookup: onPlateLookup,
        ),
        const SizedBox(height: 12),
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
        const SizedBox(height: 12),
        TextFormField(
          controller: registrationYearController,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            labelText: l10n.vehicleRegistrationYearLabel,
            hintText: l10n.vehicleRegistrationYearHint,
          ),
          validator: (value) {
            final trimmed = value?.trim() ?? '';
            if (trimmed.isEmpty) {
              return null;
            }
            final year = int.tryParse(trimmed);
            final currentYear = DateTime.now().year;
            if (year == null || year < 1980 || year > currentYear) {
              return l10n.vehicleRegistrationYearInvalid;
            }
            return null;
          },
        ),
      ],
    );
  }
}
