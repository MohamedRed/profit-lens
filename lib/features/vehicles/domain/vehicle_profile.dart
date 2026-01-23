import 'energy_type.dart';
import 'fuel_type.dart';
import 'vehicle_type.dart';

class VehicleProfile {
  final VehicleType type;
  final EnergyType energyType;
  final FuelType? fuelType;
  final double energyConsumptionPer100Km;
  final double maintenancePerKm;
  final double depreciationPerKm;

  const VehicleProfile({
    required this.type,
    required this.energyType,
    this.fuelType,
    required this.energyConsumptionPer100Km,
    required this.maintenancePerKm,
    required this.depreciationPerKm,
  });

  VehicleProfile copyWith({
    VehicleType? type,
    EnergyType? energyType,
    FuelType? fuelType,
    double? energyConsumptionPer100Km,
    double? maintenancePerKm,
    double? depreciationPerKm,
  }) {
    return VehicleProfile(
      type: type ?? this.type,
      energyType: energyType ?? this.energyType,
      fuelType: fuelType ?? this.fuelType,
      energyConsumptionPer100Km:
          energyConsumptionPer100Km ?? this.energyConsumptionPer100Km,
      maintenancePerKm: maintenancePerKm ?? this.maintenancePerKm,
      depreciationPerKm: depreciationPerKm ?? this.depreciationPerKm,
    );
  }
}
