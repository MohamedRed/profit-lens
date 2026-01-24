import 'package:flutter/material.dart';

import '../../vehicles/domain/energy_type.dart';
import '../../vehicles/domain/fuel_type.dart';
import '../../vehicles/domain/vehicle_type.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller_actions.dart';
import '../../vehicles/presentation/widgets/vehicle_section.dart';

class ProfileSetupVehicleSection extends StatelessWidget {
  final VehicleFormController controller;
  final bool useVehiclePresets;
  final ValueChanged<bool> onPresetsChanged;
  final VoidCallback onPresetEdited;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;
  final VoidCallback? onLookupModel;
  final bool isLookingUpModel;
  final bool showModelLookup;

  const ProfileSetupVehicleSection({
    super.key,
    required this.controller,
    required this.useVehiclePresets,
    required this.onPresetsChanged,
    required this.onPresetEdited,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
    required this.onLookupModel,
    required this.isLookingUpModel,
    required this.showModelLookup,
  });

  @override
  Widget build(BuildContext context) {
    return VehicleSection(
      vehicleType: controller.vehicleType,
      energyType: controller.energyType,
      fuelType: controller.fuelType,
      useVehiclePresets: useVehiclePresets,
      onVehicleTypeChanged: onVehicleTypeChanged,
      onEnergyTypeChanged: onEnergyTypeChanged,
      onFuelTypeChanged: onFuelTypeChanged,
      onPresetsChanged: onPresetsChanged,
      onPresetEdited: onPresetEdited,
      nameController: controller.nameController,
      brandController: controller.brandController,
      modelController: controller.modelController,
      consumptionController: controller.consumptionController,
      energyPriceController: controller.energyPriceController,
      maintenanceController: controller.maintenanceController,
      depreciationController: controller.depreciationController,
      consumptionSuffix: controller.consumptionSuffix(),
      energyPriceSuffix: controller.energyPriceSuffix(),
      onLookupModel: onLookupModel,
      isLookingUpModel: isLookingUpModel,
      showModelLookup: showModelLookup,
    );
  }
}
