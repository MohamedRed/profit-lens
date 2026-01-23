import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_labels.dart';

class VehicleTypeField extends StatelessWidget {
  final VehicleType value;
  final ValueChanged<VehicleType> onChanged;

  const VehicleTypeField({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return DropdownButtonFormField<VehicleType>(
      initialValue: value,
      decoration: InputDecoration(labelText: l10n.vehicleTypeLabel),
      items: VehicleType.values
          .map(
            (type) => DropdownMenuItem(
              value: type,
              child: Text(vehicleTypeLabel(l10n, type)),
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
