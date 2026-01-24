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
