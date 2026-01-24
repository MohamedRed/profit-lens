import 'package:flutter/material.dart';
import '../../vehicles/data/vehicle_model_lookup_service.dart';
import '../../vehicles/domain/energy_type.dart';
import '../../vehicles/domain/fuel_type.dart';
import '../../vehicles/domain/vehicle_type.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller_actions.dart';
import '../../vehicles/presentation/controllers/vehicle_form_defaults.dart';
import '../../vehicles/presentation/vehicle_form_actions.dart';
import '../../vehicles/presentation/vehicle_form_model_lookup.dart';
import 'profile_setup_state.dart';
extension ProfileSetupStateVehicle on ProfileSetupState {
  void applyPresetsForType({required bool setEnergyType}) {
    isApplyingPresets = true;
    if (setEnergyType) {
      final energyType = defaultEnergyTypeForVehicle(
        vehicleController.vehicleType,
      );
      vehicleController.energyType = energyType;
      vehicleController.fuelType =
          defaultFuelTypeForVehicle(vehicleController.vehicleType, energyType);
    }
    vehicleController.applyTypePresets();
    vehicleController.applyEnergyPriceDefaults(
      useFranceDefaults: businessController.useFranceDefaults,
    );
    isApplyingPresets = false;
  }
  void togglePresets(bool value) {
    useVehiclePresets = value;
    if (value) {
      applyPresetsForType(setEnergyType: true);
    }
    refresh();
  }
  void markPresetEdited() {
    if (!useVehiclePresets || isApplyingPresets) {
      return;
    }
    useVehiclePresets = false;
    refresh();
  }
  void updateDefaults(bool value) {
    businessController.useFranceDefaults = value;
    businessController.applyFranceDefaults();
    vehicleController.applyEnergyPriceDefaults(useFranceDefaults: value);
    refresh();
  }
  void changeVehicleType(VehicleType value) {
    updateVehicleType(controller: vehicleController, value: value);
    if (useVehiclePresets) {
      applyPresetsForType(setEnergyType: true);
    }
    refresh();
  }
  void changeEnergyType(EnergyType value) {
    updateEnergyType(
      controller: vehicleController,
      value: value,
      useFranceDefaults: businessController.useFranceDefaults,
    );
    if (useVehiclePresets) {
      vehicleController.applyTypePresets();
    }
    refresh();
  }
  void changeFuelType(FuelType? value) {
    updateFuelType(
      controller: vehicleController,
      value: value,
      useFranceDefaults: businessController.useFranceDefaults,
    );
    if (useVehiclePresets) {
      vehicleController.applyTypePresets();
    }
    refresh();
  }
  Future<void> lookupModel({
    required BuildContext context,
    required VehicleModelLookupService service,
  }) async {
    if (!useVehiclePresets || vehicleController.vehicleType != VehicleType.car) {
      return;
    }
    isLookingUpModel = true;
    refresh();
    await lookupVehicleModel(
      context: context,
      controller: vehicleController,
      service: service,
      energyType: vehicleController.energyType,
      onApplyStart: () => isApplyingPresets = true,
      onApplyEnd: () => isApplyingPresets = false,
    );
    if (context.mounted) {
      isLookingUpModel = false;
      refresh();
    }
  }
}
