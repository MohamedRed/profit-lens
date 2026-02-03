import 'energy_type.dart';
import 'fuel_type.dart';
import 'vehicle_type.dart';

class VehicleProfile {
  final String id;
  final String name;
  final String? brand;
  final String? model;
  final int? registrationYear;
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
    required this.brand,
    required this.model,
    required this.registrationYear,
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
    String? brand,
    String? model,
    int? registrationYear,
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
      brand: brand ?? this.brand,
      model: model ?? this.model,
      registrationYear: registrationYear ?? this.registrationYear,
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
