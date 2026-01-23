import 'package:flutter/material.dart';

import '../../domain/energy_type.dart';
import '../../domain/fuel_type.dart';
import '../../../defaults/data/france_defaults.dart';

void applyEnergyPriceDefaultsForVehicle({
  required EnergyType energyType,
  required FuelType? fuelType,
  required TextEditingController energyPriceController,
  required bool useFranceDefaults,
}) {
  if (!useFranceDefaults) {
    return;
  }
  switch (energyType) {
    case EnergyType.none:
      energyPriceController.text = '0';
      break;
    case EnergyType.electric:
      energyPriceController.text =
          FranceDefaults.electricityPricePerKwh.toStringAsFixed(4);
      break;
    case EnergyType.fuel:
      final fuel = fuelType ?? FuelType.e10;
      final price = FranceDefaults.fuelPricePerLiter[fuel] ?? 0;
      energyPriceController.text = price.toStringAsFixed(4);
      break;
  }
}

String vehicleConsumptionSuffix(EnergyType energyType) {
  switch (energyType) {
    case EnergyType.electric:
      return 'kWh/100 km';
    case EnergyType.fuel:
      return 'L/100 km';
    case EnergyType.none:
      return '';
  }
}

String vehicleEnergyPriceSuffix(EnergyType energyType) {
  switch (energyType) {
    case EnergyType.electric:
      return 'EUR/kWh';
    case EnergyType.fuel:
      return 'EUR/L';
    case EnergyType.none:
      return 'EUR';
  }
}
