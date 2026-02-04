import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../domain/energy_type.dart';
import '../domain/fuel_type.dart';
import '../domain/vehicle_type.dart';
import 'controllers/vehicle_form_controller_actions.dart';
import 'controllers/vehicle_form_defaults.dart';
import 'vehicle_form_actions.dart';
import 'vehicle_form_state.dart';

extension VehicleFormStateActions on VehicleFormState {
  void applyPresetsForType({required bool setEnergyType}) {
    isApplyingPresets = true;
    if (setEnergyType) {
      final energyType = defaultEnergyTypeForVehicle(controller.vehicleType);
      controller.energyType = energyType;
      controller.fuelType =
          defaultFuelTypeForVehicle(controller.vehicleType, energyType);
    }
    controller.applyTypePresets();
    controller.applyEnergyPriceDefaults(
      useFranceDefaults: profile.useFranceDefaults,
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

  void changeVehicleType(VehicleType value) {
    updateVehicleType(controller: controller, value: value);
    if (useVehiclePresets) {
      applyPresetsForType(setEnergyType: true);
      refresh();
      return;
    }

    final defaultEnergyType = defaultEnergyTypeForVehicle(value);
    final requiresEnergyReset = value == VehicleType.bike ||
        value == VehicleType.ebike ||
        controller.energyType == EnergyType.none;
    if (requiresEnergyReset) {
      controller.energyType = defaultEnergyType;
      controller.fuelType =
          defaultFuelTypeForVehicle(value, controller.energyType);
      controller.applyEnergyPriceDefaults(
        useFranceDefaults: profile.useFranceDefaults,
      );
      if (controller.energyType == EnergyType.none) {
        controller.consumptionController.text = '0';
        controller.energyPriceController.text = '0';
      }
    } else if (controller.energyType == EnergyType.fuel &&
        controller.fuelType == null) {
      controller.fuelType =
          defaultFuelTypeForVehicle(value, controller.energyType);
      controller.applyEnergyPriceDefaults(
        useFranceDefaults: profile.useFranceDefaults,
      );
    }
    refresh();
  }

  void changeEnergyType(EnergyType value) {
    updateEnergyType(
      controller: controller,
      value: value,
      useFranceDefaults: profile.useFranceDefaults,
    );
    if (useVehiclePresets) {
      controller.applyTypePresets();
    }
    refresh();
  }

  void changeFuelType(FuelType? value) {
    updateFuelType(
      controller: controller,
      value: value,
      useFranceDefaults: profile.useFranceDefaults,
    );
    if (useVehiclePresets) {
      controller.applyTypePresets();
    }
    refresh();
  }

  Future<void> save({
    required BuildContext context,
    required GlobalKey<FormState> formKey,
    required AuthUser user,
  }) async {
    await saveVehicleForm(
      context: context,
      formKey: formKey,
      user: user,
      profile: profile,
      existing: existing,
      controller: controller,
      onSavingChanged: (value) {
        isSaving = value;
        refresh();
      },
    );
  }
}
