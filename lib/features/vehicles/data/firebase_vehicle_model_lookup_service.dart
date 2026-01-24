import 'package:cloud_functions/cloud_functions.dart';

import '../../../core/config/app_config.dart';
import '../domain/energy_type.dart';
import 'vehicle_model_lookup_service.dart';

class FirebaseVehicleModelLookupService implements VehicleModelLookupService {
  final FirebaseFunctions? _functions;

  FirebaseVehicleModelLookupService({FirebaseFunctions? functions})
      : _functions = functions;

  @override
  Future<VehicleModelLookupResult?> lookup({
    required String brand,
    required String model,
    required EnergyType energyType,
  }) async {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
    if (energyType == EnergyType.none) {
      return null;
    }
    final callable =
        (_functions ?? FirebaseFunctions.instance).httpsCallable(
      'lookupVehicleModel',
    );
    final response = await callable.call(<String, dynamic>{
      'brand': brand,
      'model': model,
      'energyType': energyType == EnergyType.electric ? 'electric' : 'fuel',
    });

    final data = Map<String, dynamic>.from(response.data as Map);
    final matched = data['match'] == true;
    final consumption = (data['consumptionPer100Km'] as num?)?.toDouble();
    if (!matched || consumption == null) {
      return null;
    }
    return VehicleModelLookupResult(consumptionPer100Km: consumption);
  }
}
