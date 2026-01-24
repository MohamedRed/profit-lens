import 'vehicle_form_controller.dart';
import 'vehicle_form_defaults.dart';

extension VehicleFormControllerActions on VehicleFormController {
  void applyEnergyPriceDefaults({required bool useFranceDefaults}) {
    applyEnergyPriceDefaultsForVehicle(
      energyType: energyType,
      fuelType: fuelType,
      energyPriceController: energyPriceController,
      useFranceDefaults: useFranceDefaults,
    );
  }

  void applyTypePresets() {
    applyVehicleTypePresets(
      vehicleType: vehicleType,
      energyType: energyType,
      consumptionController: consumptionController,
      maintenanceController: maintenanceController,
      depreciationController: depreciationController,
    );
  }

  void applyModelConsumption(double consumptionPer100Km) {
    consumptionController.text = consumptionPer100Km.toStringAsFixed(2);
  }

  String consumptionSuffix() => vehicleConsumptionSuffix(energyType);

  String energyPriceSuffix() => vehicleEnergyPriceSuffix(energyType);
}
