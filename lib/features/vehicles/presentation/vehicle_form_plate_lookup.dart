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
    final applied = _applyPlateLookupResult(
      controller: controller,
      result: result,
      useFranceDefaults: useFranceDefaults,
      useVehiclePresets: useVehiclePresets,
    );
    onApplyEnd();
    if (!applied) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.plateLookupNotFoundMessage)),
      );
      return;
    }
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

bool _applyPlateLookupResult({
  required VehicleFormController controller,
  required VehiclePlateLookupResult result,
  required bool useFranceDefaults,
  required bool useVehiclePresets,
}) {
  var applied = false;
  final brand = _sanitizeLookupValue(result.brand);
  if (brand != null) {
    controller.brandController.text = brand;
    applied = true;
  }
  final model = _sanitizeLookupValue(result.model);
  if (model != null) {
    controller.modelController.text = model;
    applied = true;
  }
  if (result.registrationYear != null && result.registrationYear! > 0) {
    controller.registrationYearController.text =
        result.registrationYear.toString();
    applied = true;
  }
  if (result.energyType != null || result.fuelType != null) {
    applied = true;
  }
  _applyEnergyLookup(
    controller: controller,
    energyType: result.energyType,
    fuelType: result.fuelType,
    useFranceDefaults: useFranceDefaults,
  );
  if (useVehiclePresets && applied) {
    controller.applyTypePresets();
    controller.applyEnergyPriceDefaults(useFranceDefaults: useFranceDefaults);
  }
  return applied;
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

String? _sanitizeLookupValue(String? value) {
  if (value == null) return null;
  final trimmed = value.trim();
  if (trimmed.isEmpty) return null;
  final normalized = trimmed.toLowerCase();
  const unknownValues = {
    'unknown',
    'inconnu',
    'n/a',
    'na',
    'null',
    '-',
  };
  if (unknownValues.contains(normalized)) {
    return null;
  }
  if (normalized.contains('renseign') || normalized.contains('indisponible')) {
    return null;
  }
  return trimmed;
}
