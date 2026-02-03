import '../domain/energy_type.dart';
import '../domain/fuel_type.dart';

class VehiclePlateLookupResult {
  final String? brand;
  final String? model;
  final int? registrationYear;
  final EnergyType? energyType;
  final FuelType? fuelType;

  const VehiclePlateLookupResult({
    required this.brand,
    required this.model,
    required this.registrationYear,
    required this.energyType,
    required this.fuelType,
  });
}

abstract class VehiclePlateLookupService {
  Future<VehiclePlateLookupResult?> lookup({
    required String licensePlate,
    required String countryCode,
  });
}
