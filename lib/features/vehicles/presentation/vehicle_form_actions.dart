import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../domain/energy_type.dart';
import '../domain/fuel_type.dart';
import '../domain/vehicle_profile.dart';
import '../domain/vehicle_type.dart';
import 'controllers/vehicle_form_controller.dart';
import 'vehicle_form_helpers.dart';

Future<void> saveVehicleForm({
  required BuildContext context,
  required GlobalKey<FormState> formKey,
  required AuthUser user,
  required UserProfile profile,
  required VehicleProfile? existing,
  required VehicleFormController controller,
  required ValueChanged<bool> onSavingChanged,
}) async {
  final l10n = AppLocalizations.of(context)!;
  if (!(formKey.currentState?.validate() ?? false)) {
    return;
  }
  late final VehicleProfile vehicle;
  try {
    final vehicleId = buildVehicleId(user: user, existing: existing);
    vehicle = buildVehicleProfile(id: vehicleId, controller: controller);
  } catch (_) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.requiredFieldError)),
    );
    return;
  }

  onSavingChanged(true);
  try {
    await AppScope.of(context).vehicleRepository.saveVehicle(user.uid, vehicle);
    if (context.mounted) {
      Navigator.of(context).pop();
    }
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.vehicleSaveFailedMessage)),
    );
  } finally {
    if (context.mounted) {
      onSavingChanged(false);
    }
  }
}

void updateVehicleType({
  required VehicleFormController controller,
  required VehicleType value,
}) {
  controller.vehicleType = value;
}

void updateEnergyType({
  required VehicleFormController controller,
  required EnergyType value,
  required bool useFranceDefaults,
}) {
  controller.energyType = value;
  if (controller.energyType != EnergyType.fuel) {
    controller.fuelType = null;
  } else {
    controller.fuelType ??= FuelType.e10;
  }
  controller.applyEnergyPriceDefaults(useFranceDefaults: useFranceDefaults);
  if (controller.energyType == EnergyType.none) {
    controller.consumptionController.text = '0';
  }
}

void updateFuelType({
  required VehicleFormController controller,
  required FuelType? value,
  required bool useFranceDefaults,
}) {
  controller.fuelType = value;
  controller.applyEnergyPriceDefaults(useFranceDefaults: useFranceDefaults);
}
