import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';

class VehicleMaintenanceFields extends StatelessWidget {
  final TextEditingController maintenanceController;
  final TextEditingController depreciationController;

  const VehicleMaintenanceFields({
    super.key,
    required this.maintenanceController,
    required this.depreciationController,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        TextFormField(
          controller: maintenanceController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.maintenanceLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.maintenanceLabel;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: depreciationController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.depreciationLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.depreciationLabel;
            }
            return null;
          },
        ),
      ],
    );
  }
}
