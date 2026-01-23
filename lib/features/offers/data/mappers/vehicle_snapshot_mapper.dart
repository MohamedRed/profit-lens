import '../../../vehicles/domain/energy_type.dart';
import '../../../vehicles/domain/fuel_type.dart';
import '../../../vehicles/domain/vehicle_profile.dart';
import '../../../vehicles/domain/vehicle_type.dart';
import '../../../../core/extensions/iterable_extensions.dart';

class VehicleSnapshotMapper {
  VehicleProfile? fromDocument(Map<String, dynamic>? data) {
    if (data == null) return null;
    final id = data['id'] as String?;
    final name = data['name'] as String?;
    final type = _vehicleTypeFromString(data['type'] as String?);
    final energyType = _energyTypeFromString(data['energyType'] as String?);
    final consumption = (data['energyConsumptionPer100Km'] as num?)?.toDouble();
    final energyPrice = (data['energyPricePerUnit'] as num?)?.toDouble();
    final maintenance = (data['maintenancePerKm'] as num?)?.toDouble();
    final depreciation = (data['depreciationPerKm'] as num?)?.toDouble();
    if (id == null ||
        name == null ||
        type == null ||
        energyType == null ||
        consumption == null ||
        energyPrice == null ||
        maintenance == null ||
        depreciation == null) {
      return null;
    }
    return VehicleProfile(
      id: id,
      name: name,
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
      'id': vehicle.id,
      'name': vehicle.name,
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
