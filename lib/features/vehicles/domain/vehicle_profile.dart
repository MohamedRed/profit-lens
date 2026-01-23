import 'energy_type.dart';
import 'fuel_type.dart';
import 'vehicle_type.dart';

class VehicleProfile {
  final String id;
  final String name;
  final VehicleType type;
  final EnergyType energyType;
  final FuelType? fuelType;
  final double energyConsumptionPer100Km;
  final double energyPricePerUnit;
  final double maintenancePerKm;
  final double depreciationPerKm;

  const VehicleProfile({
    required this.id,
    required this.name,
    required this.type,
    required this.energyType,
    this.fuelType,
    required this.energyConsumptionPer100Km,
    required this.energyPricePerUnit,
    required this.maintenancePerKm,
    required this.depreciationPerKm,
  });

  VehicleProfile copyWith({
    String? id,
    String? name,
    VehicleType? type,
    EnergyType? energyType,
    FuelType? fuelType,
    double? energyConsumptionPer100Km,
    double? energyPricePerUnit,
    double? maintenancePerKm,
    double? depreciationPerKm,
  }) {
    return VehicleProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      type: type ?? this.type,
      energyType: energyType ?? this.energyType,
      fuelType: fuelType ?? this.fuelType,
      energyConsumptionPer100Km:
          energyConsumptionPer100Km ?? this.energyConsumptionPer100Km,
      energyPricePerUnit: energyPricePerUnit ?? this.energyPricePerUnit,
      maintenancePerKm: maintenancePerKm ?? this.maintenancePerKm,
      depreciationPerKm: depreciationPerKm ?? this.depreciationPerKm,
    );
  }
}
