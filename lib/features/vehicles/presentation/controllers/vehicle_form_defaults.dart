import 'package:flutter/material.dart';

import '../../domain/energy_type.dart';
import '../../domain/fuel_type.dart';
import '../../domain/vehicle_type.dart';
import '../../../defaults/data/france_defaults.dart';
import '../../../defaults/data/vehicle_presets_fr.dart';

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

EnergyType defaultEnergyTypeForVehicle(VehicleType type) {
  switch (type) {
    case VehicleType.bike:
      return EnergyType.none;
    case VehicleType.ebike:
      return EnergyType.electric;
    case VehicleType.scooter:
    case VehicleType.car:
      return EnergyType.fuel;
  }
}

FuelType? defaultFuelTypeForVehicle(VehicleType type, EnergyType energyType) {
  if (energyType != EnergyType.fuel) {
    return null;
  }
  switch (type) {
    case VehicleType.bike:
    case VehicleType.ebike:
      return null;
    case VehicleType.scooter:
    case VehicleType.car:
      return FuelType.e10;
  }
}

void applyVehicleTypePresets({
  required VehicleType vehicleType,
  required EnergyType energyType,
  required TextEditingController consumptionController,
  required TextEditingController maintenanceController,
  required TextEditingController depreciationController,
}) {
  final preset = VehiclePresetsFr.forTypeEnergy(vehicleType, energyType);
  consumptionController.text = preset.consumptionPer100Km.toStringAsFixed(2);
  maintenanceController.text = preset.maintenancePerKm.toStringAsFixed(2);
  depreciationController.text = preset.depreciationPerKm.toStringAsFixed(2);
}
