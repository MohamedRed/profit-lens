import 'package:profit_lens/features/vehicles/data/vehicle_model_lookup_service.dart';
import 'package:profit_lens/features/vehicles/domain/energy_type.dart';

class StubVehicleModelLookupService implements VehicleModelLookupService {
  const StubVehicleModelLookupService();

  @override
  Future<VehicleModelLookupResult?> lookup({
    required String brand,
    required String model,
    required EnergyType energyType,
  }) async {
    return null;
  }
}
