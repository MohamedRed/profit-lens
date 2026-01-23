import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';

class VehicleNameField extends StatelessWidget {
  final TextEditingController controller;

  const VehicleNameField({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: l10n.vehicleNameLabel),
      validator: (value) {
        if (value == null || value.trim().isEmpty) {
          return l10n.requiredFieldError;
        }
        return null;
      },
    );
  }
}
