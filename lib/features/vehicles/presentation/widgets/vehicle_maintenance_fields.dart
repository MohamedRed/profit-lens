import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';

class VehicleMaintenanceFields extends StatelessWidget {
  final TextEditingController maintenanceController;
  final TextEditingController depreciationController;
  final ValueChanged<String>? onMaintenanceChanged;
  final ValueChanged<String>? onDepreciationChanged;

  const VehicleMaintenanceFields({
    super.key,
    required this.maintenanceController,
    required this.depreciationController,
    this.onMaintenanceChanged,
    this.onDepreciationChanged,
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
          onChanged: onMaintenanceChanged,
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
          onChanged: onDepreciationChanged,
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
