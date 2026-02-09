import 'package:cloud_functions/cloud_functions.dart';

import '../../../core/config/app_config.dart';
import '../../../core/config/firebase_regions.dart';
import '../../../core/extensions/iterable_extensions.dart';
import '../domain/energy_type.dart';
import '../domain/fuel_type.dart';
import 'vehicle_plate_lookup_service.dart';

class FirebaseVehiclePlateLookupService implements VehiclePlateLookupService {
  final FirebaseFunctions? _functions;

  FirebaseVehiclePlateLookupService({FirebaseFunctions? functions})
    : _functions = functions;

  @override
  Future<VehiclePlateLookupResult?> lookup({
    required String licensePlate,
    required String countryCode,
  }) async {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
    final callable =
        (_functions ??
                FirebaseFunctions.instanceFor(region: firebaseFunctionsRegion))
            .httpsCallable('lookupVehicleByPlate');
    final response = await callable.call(<String, dynamic>{
      'licensePlate': licensePlate,
      'countryCode': countryCode,
    });

    final data = Map<String, dynamic>.from(response.data as Map);
    final matched = data['match'] == true;
    if (!matched) {
      return null;
    }
    return VehiclePlateLookupResult(
      brand: data['brand'] as String?,
      model: data['model'] as String?,
      registrationYear: (data['registrationYear'] as num?)?.toInt(),
      energyType: _energyTypeFromString(data['energyType'] as String?),
      fuelType: _fuelTypeFromString(data['fuelType'] as String?),
    );
  }
}

EnergyType? _energyTypeFromString(String? value) {
  if (value == null) return null;
  return EnergyType.values
      .where((element) => element.name == value)
      .firstOrNull;
}

FuelType? _fuelTypeFromString(String? value) {
  if (value == null) return null;
  return FuelType.values.where((element) => element.name == value).firstOrNull;
}
