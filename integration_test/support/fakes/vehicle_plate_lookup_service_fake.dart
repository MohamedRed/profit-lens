import 'package:profit_lens/features/vehicles/data/vehicle_plate_lookup_service.dart';

class StubVehiclePlateLookupService implements VehiclePlateLookupService {
  const StubVehiclePlateLookupService();

  @override
  Future<VehiclePlateLookupResult?> lookup({
    required String licensePlate,
    required String countryCode,
  }) async {
    return null;
  }
}
