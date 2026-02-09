import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_identity_fields.dart';
import 'vehicle_preset_toggle.dart';
import 'vehicle_type_field.dart';

class VehicleDetailsSection extends StatelessWidget {
  final VehicleType vehicleType;
  final bool useVehiclePresets;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<bool> onPresetsChanged;
  final VoidCallback onPresetEdited;
  final TextEditingController licensePlateController;
  final TextEditingController brandController;
  final TextEditingController modelController;
  final TextEditingController registrationYearController;
  final VoidCallback? onModelLookup;
  final VoidCallback? onPlateLookup;
  final bool isLookingUpPlate;

  const VehicleDetailsSection({
    super.key,
    required this.vehicleType,
    required this.useVehiclePresets,
    required this.onVehicleTypeChanged,
    required this.onPresetsChanged,
    required this.onPresetEdited,
    required this.licensePlateController,
    required this.brandController,
    required this.modelController,
    required this.registrationYearController,
    required this.onModelLookup,
    required this.onPlateLookup,
    required this.isLookingUpPlate,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final showLicensePlate =
        vehicleType == VehicleType.car || vehicleType == VehicleType.scooter;
    return SectionCard(
      title: l10n.vehicleDetailsSectionTitle,
      children: [
        VehiclePresetToggle(
          value: useVehiclePresets,
          onChanged: onPresetsChanged,
        ),
        const SizedBox(height: 12),
        VehicleTypeField(value: vehicleType, onChanged: onVehicleTypeChanged),
        const SizedBox(height: 12),
        VehicleIdentityFields(
          vehicleType: vehicleType,
          licensePlateController: licensePlateController,
          brandController: brandController,
          modelController: modelController,
          registrationYearController: registrationYearController,
          onModelLookup: onModelLookup,
          onPlateLookup: onPlateLookup,
          isLookingUpPlate: isLookingUpPlate,
          showLicensePlate: showLicensePlate,
        ),
      ],
    );
  }
}
