import '../../vehicles/domain/vehicle_type.dart';
import '../domain/place_selection.dart';
import '../domain/route_verification.dart';

abstract class RouteVerificationService {
  Future<RouteVerification> verifyRoute({
    required PlaceSelection origin,
    required PlaceSelection destination,
    required VehicleType vehicleType,
  });
}
