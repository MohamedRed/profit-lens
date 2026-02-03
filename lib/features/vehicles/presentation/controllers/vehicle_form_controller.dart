import 'package:flutter/material.dart';

import '../../domain/energy_type.dart';
import '../../domain/fuel_type.dart';
import '../../domain/vehicle_profile.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_form_defaults.dart';

class VehicleFormController {
  final TextEditingController licensePlateController;
  final TextEditingController brandController;
  final TextEditingController modelController;
  final TextEditingController registrationYearController;
  final TextEditingController consumptionController;
  final TextEditingController energyPriceController;
  final TextEditingController maintenanceController;
  final TextEditingController depreciationController;

  VehicleType vehicleType;
  EnergyType energyType;
  FuelType? fuelType;

  VehicleFormController({
    required this.licensePlateController,
    required this.brandController,
    required this.modelController,
    required this.registrationYearController,
    required this.consumptionController,
    required this.energyPriceController,
    required this.maintenanceController,
    required this.depreciationController,
    required this.vehicleType,
    required this.energyType,
    required this.fuelType,
  });

  factory VehicleFormController.fromVehicle({
    required VehicleProfile? vehicle,
    required bool useFranceDefaults,
  }) {
    final licensePlateController = TextEditingController(
      text: vehicle?.licensePlate ?? '',
    );
    final brandController = TextEditingController(text: vehicle?.brand ?? '');
    final modelController = TextEditingController(text: vehicle?.model ?? '');
    final registrationYearController = TextEditingController(
      text: vehicle?.registrationYear?.toString() ?? '',
    );
    final consumptionController = TextEditingController(
      text: vehicle == null
          ? ''
          : vehicle.energyConsumptionPer100Km.toStringAsFixed(2),
    );
    final energyPriceController = TextEditingController(
      text: vehicle == null
          ? ''
          : vehicle.energyPricePerUnit.toStringAsFixed(4),
    );
    final maintenanceController = TextEditingController(
      text: vehicle == null ? '' : vehicle.maintenancePerKm.toStringAsFixed(2),
    );
    final depreciationController = TextEditingController(
      text: vehicle == null ? '' : vehicle.depreciationPerKm.toStringAsFixed(2),
    );

    final controller = VehicleFormController(
      licensePlateController: licensePlateController,
      brandController: brandController,
      modelController: modelController,
      registrationYearController: registrationYearController,
      consumptionController: consumptionController,
      energyPriceController: energyPriceController,
      maintenanceController: maintenanceController,
      depreciationController: depreciationController,
      vehicleType: vehicle?.type ?? VehicleType.bike,
      energyType: vehicle?.energyType ?? EnergyType.none,
      fuelType: vehicle?.fuelType ?? FuelType.e10,
    );

    if (vehicle == null) {
      applyEnergyPriceDefaultsForVehicle(
        energyType: controller.energyType,
        fuelType: controller.fuelType,
        energyPriceController: controller.energyPriceController,
        useFranceDefaults: useFranceDefaults,
      );
      if (controller.energyType == EnergyType.none) {
        controller.consumptionController.text = '0';
      }
    }
    return controller;
  }

  void dispose() {
    licensePlateController.dispose();
    brandController.dispose();
    modelController.dispose();
    registrationYearController.dispose();
    consumptionController.dispose();
    energyPriceController.dispose();
    maintenanceController.dispose();
    depreciationController.dispose();
  }
}
