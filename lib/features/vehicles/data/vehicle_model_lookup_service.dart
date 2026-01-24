import '../domain/energy_type.dart';

class VehicleModelLookupResult {
  final double consumptionPer100Km;

  const VehicleModelLookupResult({required this.consumptionPer100Km});
}

abstract class VehicleModelLookupService {
  Future<VehicleModelLookupResult?> lookup({
    required String brand,
    required String model,
    required EnergyType energyType,
  });
}
