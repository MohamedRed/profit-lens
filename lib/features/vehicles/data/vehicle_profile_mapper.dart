import '../../../core/extensions/iterable_extensions.dart';
import '../domain/energy_type.dart';
import '../domain/fuel_type.dart';
import '../domain/vehicle_profile.dart';
import '../domain/vehicle_type.dart';

class VehicleProfileMapper {
  VehicleProfile fromDocument(String id, Map<String, dynamic> data) {
    final type = _vehicleTypeFromString(data['type'] as String?);
    final energyType = _energyTypeFromString(data['energyType'] as String?);
    final name = data['name'] as String?;
    final brand = data['brand'] as String?;
    final model = data['model'] as String?;
    final consumption = (data['energyConsumptionPer100Km'] as num?)?.toDouble();
    final energyPrice = (data['energyPricePerUnit'] as num?)?.toDouble();
    final maintenance = (data['maintenancePerKm'] as num?)?.toDouble();
    final depreciation = (data['depreciationPerKm'] as num?)?.toDouble();
    if (type == null ||
        energyType == null ||
        name == null ||
        consumption == null ||
        energyPrice == null ||
        maintenance == null ||
        depreciation == null) {
      throw StateError('Vehicle profile is missing required fields.');
    }
    return VehicleProfile(
      id: id,
      name: name,
      brand: brand,
      model: model,
      type: type,
      energyType: energyType,
      fuelType: _fuelTypeFromString(data['fuelType'] as String?),
      energyConsumptionPer100Km: consumption,
      energyPricePerUnit: energyPrice,
      maintenancePerKm: maintenance,
      depreciationPerKm: depreciation,
    );
  }

  Map<String, dynamic> toDocument(VehicleProfile vehicle) {
    return {
      'name': vehicle.name,
      'brand': vehicle.brand,
      'model': vehicle.model,
      'type': vehicle.type.name,
      'energyType': vehicle.energyType.name,
      'fuelType': vehicle.fuelType?.name,
      'energyConsumptionPer100Km': vehicle.energyConsumptionPer100Km,
      'energyPricePerUnit': vehicle.energyPricePerUnit,
      'maintenancePerKm': vehicle.maintenancePerKm,
      'depreciationPerKm': vehicle.depreciationPerKm,
    };
  }

  VehicleType? _vehicleTypeFromString(String? value) {
    if (value == null) return null;
    return VehicleType.values
        .where((element) => element.name == value)
        .firstOrNull;
  }

  EnergyType? _energyTypeFromString(String? value) {
    if (value == null) return null;
    return EnergyType.values
        .where((element) => element.name == value)
        .firstOrNull;
  }

  FuelType? _fuelTypeFromString(String? value) {
    if (value == null) return null;
    return FuelType.values
        .where((element) => element.name == value)
        .firstOrNull;
  }
}
