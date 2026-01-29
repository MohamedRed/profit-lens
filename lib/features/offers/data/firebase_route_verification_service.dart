import 'package:cloud_functions/cloud_functions.dart';

import '../../../core/config/app_config.dart';
import '../../../core/config/firebase_regions.dart';
import '../../vehicles/domain/vehicle_type.dart';
import '../domain/place_selection.dart';
import '../domain/route_verification.dart';
import 'route_verification_service.dart';

class FirebaseRouteVerificationService implements RouteVerificationService {
  final FirebaseFunctions? _functions;

  FirebaseRouteVerificationService({FirebaseFunctions? functions})
      : _functions = functions;

  @override
  Future<RouteVerification> verifyRoute({
    required PlaceSelection origin,
    required PlaceSelection destination,
    required VehicleType vehicleType,
  }) async {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
    final callable = (_functions ??
            FirebaseFunctions.instanceFor(region: firebaseFunctionsRegion))
        .httpsCallable('verifyOfferRoute');
    final response = await callable.call(<String, dynamic>{
      'origin': _encodeLocation(origin),
      'destination': _encodeLocation(destination),
      'travelMode': _mapTravelMode(vehicleType),
    });
    final data = Map<String, dynamic>.from(response.data as Map);
    final distance = (data['distanceKm'] as num?)?.toDouble();
    final duration = (data['durationMinutes'] as num?)?.toDouble();
    if (distance == null || duration == null) {
      throw StateError('Missing route verification data.');
    }
    return RouteVerification(
      distanceKm: distance,
      durationMinutes: duration,
      provider: data['provider'] as String? ?? 'google_routes',
      travelMode: data['travelMode'] as String? ?? _mapTravelMode(vehicleType),
      verifiedAt: DateTime.tryParse(data['verifiedAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> _encodeLocation(PlaceSelection selection) {
    final placeId = selection.placeId?.trim();
    if (placeId != null && placeId.isNotEmpty) {
      return {'placeId': placeId};
    }
    final lat = selection.latitude;
    final lng = selection.longitude;
    if (lat != null && lng != null) {
      return {
        'latLng': {'lat': lat, 'lng': lng}
      };
    }
    throw StateError('Missing placeId/latLng for route verification.');
  }

  String _mapTravelMode(VehicleType type) {
    switch (type) {
      case VehicleType.bike:
      case VehicleType.ebike:
        return 'BICYCLE';
      case VehicleType.scooter:
        return 'TWO_WHEELER';
      case VehicleType.car:
        return 'DRIVE';
    }
  }
}
