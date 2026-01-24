import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import 'vehicle_name_field.dart';

class VehicleIdentityFields extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController brandController;
  final TextEditingController modelController;
  final VoidCallback? onLookupModel;
  final bool isLookingUp;
  final bool showLookup;

  const VehicleIdentityFields({
    super.key,
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
        TextFormField(
          controller: brandController,
          decoration: InputDecoration(labelText: l10n.vehicleBrandLabel),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: modelController,
          decoration: InputDecoration(labelText: l10n.vehicleModelLabel),
          textInputAction: TextInputAction.done,
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
