import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../vehicles/domain/vehicle_profile.dart';

class VehiclePickerSection extends StatelessWidget {
  final List<VehicleProfile> vehicles;
  final String? selectedVehicleId;
  final ValueChanged<String?> onChanged;

  const VehiclePickerSection({
    super.key,
    required this.vehicles,
    required this.selectedVehicleId,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.vehicleSection,
      showSurface: false,
      showBorder: true,
      children: [
        DropdownButtonFormField<String>(
          initialValue: selectedVehicleId,
          items: vehicles
              .map(
                (vehicle) => DropdownMenuItem(
                  value: vehicle.id,
                  child: Text(vehicle.name),
                ),
              )
              .toList(),
          onChanged: onChanged,
          decoration: InputDecoration(labelText: l10n.vehicleSelectLabel),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
      ],
    );
  }
}
