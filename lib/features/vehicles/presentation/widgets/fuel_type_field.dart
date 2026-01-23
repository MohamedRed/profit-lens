import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/fuel_type.dart';
import 'vehicle_labels.dart';

class FuelTypeField extends StatelessWidget {
  final FuelType? value;
  final ValueChanged<FuelType?> onChanged;

  const FuelTypeField({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return DropdownButtonFormField<FuelType>(
      key: ValueKey(value),
      initialValue: value,
      decoration: InputDecoration(labelText: l10n.fuelTypeLabel),
      items: FuelType.values
          .map(
            (type) => DropdownMenuItem(
              value: type,
              child: Text(fuelTypeLabel(l10n, type)),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }
}
