import '../../vehicles/domain/energy_type.dart';
import '../../vehicles/domain/fuel_type.dart';
import '../../vehicles/domain/vehicle_type.dart';
import 'france_defaults.dart';
class VehiclePresetDefaults {
  final EnergyType energyType;
  final FuelType? fuelType;
  final double consumptionPer100Km;
  final double maintenancePerKm;
  final double depreciationPerKm;
  const VehiclePresetDefaults({
    required this.energyType,
    required this.fuelType,
    required this.consumptionPer100Km,
    required this.maintenancePerKm,
    required this.depreciationPerKm,
  });
}
class VehiclePresetsFr {
  static const VehiclePresetDefaults bike = VehiclePresetDefaults(
    energyType: EnergyType.none,
    fuelType: null,
    consumptionPer100Km: 0,
    maintenancePerKm: 0.02,
    depreciationPerKm: 0.01,
  );
  static const VehiclePresetDefaults eBike = VehiclePresetDefaults(
    energyType: EnergyType.electric,
    fuelType: null,
    consumptionPer100Km: 1.0,
    maintenancePerKm: 0.03,
    depreciationPerKm: 0.05,
  );
  static const VehiclePresetDefaults scooterFuel = VehiclePresetDefaults(
    energyType: EnergyType.fuel,
    fuelType: FuelType.e10,
    consumptionPer100Km: 3.2,
    maintenancePerKm: 0.04,
    depreciationPerKm: 0.06,
  );
  static const VehiclePresetDefaults scooterElectric = VehiclePresetDefaults(
    energyType: EnergyType.electric,
    fuelType: null,
    consumptionPer100Km: 4.0,
    maintenancePerKm: 0.04,
    depreciationPerKm: 0.06,
  );
  static const VehiclePresetDefaults carFuel = VehiclePresetDefaults(
    energyType: EnergyType.fuel,
    fuelType: FuelType.e10,
    consumptionPer100Km: 6.5,
    maintenancePerKm: 0.05,
    depreciationPerKm: 0.12,
  );
  static const VehiclePresetDefaults carElectric = VehiclePresetDefaults(
    energyType: EnergyType.electric,
    fuelType: null,
    consumptionPer100Km: 17.0,
    maintenancePerKm: 0.05,
    depreciationPerKm: 0.12,
  );
  static VehiclePresetDefaults defaultForType(VehicleType type) {
    switch (type) {
      case VehicleType.bike:
        return bike;
      case VehicleType.ebike:
        return eBike;
      case VehicleType.scooter:
        return scooterFuel;
      case VehicleType.car:
        return carFuel;
    }
  }
  static VehiclePresetDefaults forTypeEnergy(
    VehicleType type,
    EnergyType energyType,
  ) {
    if (type == VehicleType.scooter && energyType == EnergyType.electric) {
      return scooterElectric;
    }
    if (type == VehicleType.car && energyType == EnergyType.electric) {
      return carElectric;
    }
    return defaultForType(type);
  }
  static const List<DefaultSource> sources = [
    DefaultSource(
      label: "ADEME car labelling dataset (consumption for cars)",
      url: "https://data.ademe.fr/datasets/ademe-car-labelling",
      lastChecked: "2026-01-24",
    ),
    DefaultSource(
      label: "ProfitLens baseline estimates (maintenance & depreciation)",
      url: "https://github.com/MohamedRed/profit-lens/blob/main/docs/vehicle-presets.md",
      lastChecked: "2026-01-24",
    ),
  ];
}
