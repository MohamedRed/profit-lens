import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_name_field.dart';
import 'vehicle_brand_autocomplete_field.dart';
import 'vehicle_model_autocomplete_field.dart';

class VehicleIdentityFields extends StatelessWidget {
  final VehicleType vehicleType;
  final TextEditingController nameController;
  final TextEditingController brandController;
  final TextEditingController modelController;
  final VoidCallback? onLookupModel;
  final bool isLookingUp;
  final bool showLookup;

  const VehicleIdentityFields({
    super.key,
    required this.vehicleType,
    required this.nameController,
    required this.brandController,
    required this.modelController,
    required this.onLookupModel,
    required this.isLookingUp,
    required this.showLookup,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        VehicleNameField(controller: nameController),
        const SizedBox(height: 12),
        VehicleBrandAutocompleteField(
          vehicleType: vehicleType,
          controller: brandController,
        ),
        const SizedBox(height: 12),
        VehicleModelAutocompleteField(
          vehicleType: vehicleType,
          brandController: brandController,
          controller: modelController,
          onEditingComplete: onLookupModel,
        ),
        if (showLookup) ...[
          const SizedBox(height: 8),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: isLookingUp ? null : onLookupModel,
              icon: isLookingUp
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.search),
              label: Text(l10n.modelLookupButton),
            ),
          ),
        ],
      ],
    );
  }
}
