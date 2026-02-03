import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../data/vehicle_plate_lookup_service.dart';
import '../domain/energy_type.dart';
import '../domain/fuel_type.dart';
import '../domain/license_plate.dart';
import 'controllers/vehicle_form_controller.dart';
import 'controllers/vehicle_form_controller_actions.dart';

Future<void> lookupVehiclePlate({
  required BuildContext context,
  required VehicleFormController controller,
  required VehiclePlateLookupService service,
  required bool useFranceDefaults,
  required bool useVehiclePresets,
  required VoidCallback onApplyStart,
  required VoidCallback onApplyEnd,
}) async {
  final l10n = AppLocalizations.of(context)!;
  final rawPlate = controller.licensePlateController.text.trim();
  if (rawPlate.isEmpty) {
    return;
  }
  if (!isValidFrenchLicensePlate(rawPlate)) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.vehicleLicensePlateInvalid)),
    );
    return;
  }
  final normalized = normalizeFrenchLicensePlate(rawPlate);
  controller.licensePlateController.text =
      formatFrenchLicensePlate(normalized);

  try {
    final result = await service.lookup(
      licensePlate: normalized,
      countryCode: 'FR',
    );
    if (!context.mounted) return;
    if (result == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.plateLookupNotFoundMessage)),
      );
      return;
    }
    onApplyStart();
    _applyPlateLookupResult(
      controller: controller,
      result: result,
      useFranceDefaults: useFranceDefaults,
      useVehiclePresets: useVehiclePresets,
    );
    onApplyEnd();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.plateLookupAppliedMessage)),
    );
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.plateLookupFailedMessage)),
    );
  }
}

void _applyPlateLookupResult({
  required VehicleFormController controller,
  required VehiclePlateLookupResult result,
  required bool useFranceDefaults,
  required bool useVehiclePresets,
}) {
  if (result.brand != null && result.brand!.trim().isNotEmpty) {
    controller.brandController.text = result.brand!;
  }
  if (result.model != null && result.model!.trim().isNotEmpty) {
    controller.modelController.text = result.model!;
  }
  if (result.registrationYear != null) {
    controller.registrationYearController.text =
        result.registrationYear.toString();
  }
  _applyEnergyLookup(
    controller: controller,
    energyType: result.energyType,
    fuelType: result.fuelType,
    useFranceDefaults: useFranceDefaults,
  );
  if (useVehiclePresets) {
    controller.applyTypePresets();
    controller.applyEnergyPriceDefaults(useFranceDefaults: useFranceDefaults);
  }
}

void _applyEnergyLookup({
  required VehicleFormController controller,
  required EnergyType? energyType,
  required FuelType? fuelType,
  required bool useFranceDefaults,
}) {
  if (energyType == null && fuelType == null) {
    return;
  }
  if (energyType != null) {
    controller.energyType = energyType;
  } else if (fuelType != null) {
    controller.energyType = EnergyType.fuel;
  }
  if (controller.energyType != EnergyType.fuel) {
    controller.fuelType = null;
  } else if (fuelType != null) {
    controller.fuelType = fuelType;
  }

  if (controller.energyType != EnergyType.fuel || fuelType != null) {
    controller.applyEnergyPriceDefaults(useFranceDefaults: useFranceDefaults);
  }
  if (controller.energyType == EnergyType.none) {
    controller.consumptionController.text = '0';
  }
}
