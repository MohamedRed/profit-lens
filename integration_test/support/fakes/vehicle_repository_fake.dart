import 'dart:async';

import 'package:profit_lens/features/vehicles/data/vehicle_repository.dart';
import 'package:profit_lens/features/vehicles/domain/vehicle_profile.dart';

class InMemoryVehicleRepository implements VehicleRepository {
  InMemoryVehicleRepository({List<VehicleProfile>? initialVehicles})
      : _vehicles = List<VehicleProfile>.from(initialVehicles ?? const []);

  final List<VehicleProfile> _vehicles;
  final StreamController<List<VehicleProfile>> _controller =
      StreamController<List<VehicleProfile>>.broadcast();

  @override
  Stream<List<VehicleProfile>> watchVehicles(String uid) async* {
    yield List<VehicleProfile>.unmodifiable(_vehicles);
    yield* _controller.stream;
  }

  @override
  Future<List<VehicleProfile>> fetchVehicles(String uid) async =>
      List<VehicleProfile>.unmodifiable(_vehicles);

  @override
  Future<void> saveVehicle(String uid, VehicleProfile vehicle) async {
    final index = _vehicles.indexWhere((item) => item.id == vehicle.id);
    if (index >= 0) {
      _vehicles[index] = vehicle;
    } else {
      _vehicles.add(vehicle);
    }
    _controller.add(List<VehicleProfile>.unmodifiable(_vehicles));
  }

  @override
  Future<void> deleteVehicle(String uid, String vehicleId) async {
    _vehicles.removeWhere((item) => item.id == vehicleId);
    _controller.add(List<VehicleProfile>.unmodifiable(_vehicles));
  }
}
