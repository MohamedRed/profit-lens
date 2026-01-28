import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';

String? resolveVehicleId({
  required UserProfile profile,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
}) {
  if (vehicles.isEmpty) {
    return null;
  }
  if (selectedVehicleId != null &&
      vehicles.any((vehicle) => vehicle.id == selectedVehicleId)) {
    return selectedVehicleId;
  }
  return profile.defaultVehicleId ?? vehicles.first.id;
}
