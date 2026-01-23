import '../domain/vehicle_profile.dart';

abstract class VehicleRepository {
  Stream<List<VehicleProfile>> watchVehicles(String uid);
  Future<List<VehicleProfile>> fetchVehicles(String uid);
  Future<void> saveVehicle(String uid, VehicleProfile vehicle);
  Future<void> deleteVehicle(String uid, String vehicleId);
}
