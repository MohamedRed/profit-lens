import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/energy_type.dart';
import '../../domain/fuel_type.dart';
import '../../domain/vehicle_type.dart';
import 'energy_type_field.dart';
import 'fuel_type_field.dart';
import 'vehicle_energy_fields.dart';
import 'vehicle_identity_fields.dart';
import 'vehicle_maintenance_fields.dart';
import 'vehicle_preset_toggle.dart';
import 'vehicle_type_field.dart';

class VehicleSection extends StatelessWidget {
  final VehicleType vehicleType;
  final EnergyType energyType;
  final FuelType? fuelType;
  final bool useVehiclePresets;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;
  final ValueChanged<bool> onPresetsChanged;
  final VoidCallback onPresetEdited;
  final TextEditingController brandController, modelController;
  final TextEditingController consumptionController, energyPriceController;
  final TextEditingController maintenanceController, depreciationController;
  final String consumptionSuffix, energyPriceSuffix;
  final VoidCallback? onModelLookup;

  const VehicleSection({
    super.key,
    required this.vehicleType,
    required this.energyType,
    required this.fuelType,
    required this.useVehiclePresets,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
    required this.onPresetsChanged,
    required this.onPresetEdited,
    required this.brandController,
    required this.modelController,
    required this.consumptionController,
    required this.energyPriceController,
    required this.maintenanceController,
    required this.depreciationController,
    required this.consumptionSuffix,
    required this.energyPriceSuffix,
    required this.onModelLookup,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.vehicleSection,
      children: [
        VehiclePresetToggle(
          value: useVehiclePresets,
          onChanged: onPresetsChanged,
        ),
        const SizedBox(height: 12),
        VehicleTypeField(
          value: vehicleType,
          onChanged: onVehicleTypeChanged,
        ),
        const SizedBox(height: 12),
        VehicleIdentityFields(
          vehicleType: vehicleType,
          brandController: brandController,
          modelController: modelController,
          onModelLookup: onModelLookup,
        ),
        const SizedBox(height: 12),
        EnergyTypeField(
          value: energyType,
          onChanged: onEnergyTypeChanged,
        ),
        if (energyType == EnergyType.fuel) ...[
          const SizedBox(height: 12),
          FuelTypeField(
            value: fuelType,
            onChanged: onFuelTypeChanged,
          ),
        ],
        const SizedBox(height: 12),
        VehicleEnergyFields(
          consumptionController: consumptionController,
          energyPriceController: energyPriceController,
          consumptionSuffix: consumptionSuffix,
          energyPriceSuffix: energyPriceSuffix,
          onConsumptionChanged: (_) => onPresetEdited(),
        ),
        const SizedBox(height: 12),
        VehicleMaintenanceFields(
          maintenanceController: maintenanceController,
          depreciationController: depreciationController,
          onMaintenanceChanged: (_) => onPresetEdited(),
          onDepreciationChanged: (_) => onPresetEdited(),
        ),
      ],
    );
  }
}
