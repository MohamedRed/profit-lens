import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../vehicles/domain/vehicle_profile.dart';

class VehiclePickerHeader extends StatelessWidget {
  final List<VehicleProfile> vehicles;
  final String? selectedVehicleId;
  final ValueChanged<String?> onChanged;

  const VehiclePickerHeader({
    super.key,
    required this.vehicles,
    required this.selectedVehicleId,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      margin: const EdgeInsets.fromLTRB(24, 8, 24, 8),
      padding: const EdgeInsets.all(ShadcnSpacing.lg),
      decoration: BoxDecoration(
        color: ShadcnColors.surface,
        borderRadius: BorderRadius.circular(ShadcnRadius.xl),
        border: Border.all(
          color: ShadcnColors.outline.withOpacity(0.5),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.vehicleSection,
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: ShadcnSpacing.sm),
          DropdownButtonFormField<String>(
            isExpanded: true,
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
            decoration: InputDecoration(
              labelText: l10n.vehicleSelectLabel,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: ShadcnSpacing.md,
                vertical: ShadcnSpacing.md,
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return l10n.requiredFieldError;
              }
              return null;
            },
          ),
        ],
      ),
    );
  }
}
