import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/energy_type.dart';
import 'vehicle_labels.dart';

class EnergyTypeField extends StatelessWidget {
  final EnergyType value;
  final ValueChanged<EnergyType> onChanged;

  const EnergyTypeField({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return DropdownButtonFormField<EnergyType>(
      value: value,
      decoration: InputDecoration(labelText: l10n.energyTypeLabel),
      items: EnergyType.values
          .map(
            (type) => DropdownMenuItem(
              value: type,
              child: Text(energyTypeLabel(l10n, type)),
            ),
          )
          .toList(),
      onChanged: (value) {
        if (value != null) {
          onChanged(value);
        }
      },
    );
  }
}
