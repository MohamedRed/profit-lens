import 'package:flutter/material.dart';

import '../../vehicles/domain/energy_type.dart';
import '../../vehicles/domain/fuel_type.dart';
import '../../vehicles/domain/vehicle_type.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller_actions.dart';
import '../../vehicles/presentation/widgets/vehicle_costs_section.dart';
import '../../vehicles/presentation/widgets/vehicle_details_section.dart';
import '../../vehicles/presentation/widgets/vehicle_energy_section.dart';

class ProfileSetupVehicleSection extends StatelessWidget {
  final VehicleFormController controller;
  final bool useVehiclePresets;
  final ValueChanged<bool> onPresetsChanged;
  final VoidCallback onPresetEdited;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;
  final VoidCallback? onModelLookup;
  final VoidCallback? onPlateLookup;
  final bool isLookingUpPlate;

  const ProfileSetupVehicleSection({
    super.key,
    required this.controller,
    required this.useVehiclePresets,
    required this.onPresetsChanged,
    required this.onPresetEdited,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
    required this.onModelLookup,
    required this.onPlateLookup,
    required this.isLookingUpPlate,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        VehicleDetailsSection(
      vehicleType: controller.vehicleType,
      useVehiclePresets: useVehiclePresets,
      onVehicleTypeChanged: onVehicleTypeChanged,
      onPresetsChanged: onPresetsChanged,
      onPresetEdited: onPresetEdited,
      licensePlateController: controller.licensePlateController,
      brandController: controller.brandController,
      modelController: controller.modelController,
      registrationYearController: controller.registrationYearController,
      onModelLookup: onModelLookup,
      onPlateLookup: onPlateLookup,
      isLookingUpPlate: isLookingUpPlate,
        ),
        const SizedBox(height: 12),
        VehicleEnergySection(
          vehicleType: controller.vehicleType,
          energyType: controller.energyType,
          fuelType: controller.fuelType,
          onEnergyTypeChanged: onEnergyTypeChanged,
          onFuelTypeChanged: onFuelTypeChanged,
          onPresetEdited: onPresetEdited,
          consumptionController: controller.consumptionController,
          energyPriceController: controller.energyPriceController,
          consumptionSuffix: controller.consumptionSuffix(),
          energyPriceSuffix: controller.energyPriceSuffix(),
        ),
        const SizedBox(height: 12),
        VehicleCostsSection(
          maintenanceController: controller.maintenanceController,
          depreciationController: controller.depreciationController,
          onPresetEdited: onPresetEdited,
        ),
      ],
    );
  }
}
