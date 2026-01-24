import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/utils/number_parsing.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/vehicle_profile.dart';
import 'controllers/vehicle_form_controller.dart';

String buildVehicleId({
  required AuthUser user,
  required VehicleProfile? existing,
}) {
  return existing?.id ??
      FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .collection('vehicles')
          .doc()
          .id;
}

VehicleProfile buildVehicleProfile({
  required String id,
  required VehicleFormController controller,
}) {
  final brand = controller.brandController.text.trim();
  final model = controller.modelController.text.trim();
  final consumption =
      NumberParsing.parseDouble(controller.consumptionController.text);
  final energyPrice =
      NumberParsing.parseDouble(controller.energyPriceController.text);
  final maintenance =
      NumberParsing.parseDouble(controller.maintenanceController.text);
  final depreciation =
      NumberParsing.parseDouble(controller.depreciationController.text);
  if (consumption == null || energyPrice == null) {
    throw StateError('Missing required vehicle costs.');
  }
  if (maintenance == null || depreciation == null) {
    throw StateError('Missing required vehicle costs.');
  }
  if (brand.isEmpty || model.isEmpty) {
    throw StateError('Missing required vehicle identity.');
  }
  return VehicleProfile(
    id: id,
    name: '$brand $model',
    brand: brand,
    model: model,
    type: controller.vehicleType,
    energyType: controller.energyType,
    fuelType: controller.fuelType,
    energyConsumptionPer100Km: consumption,
    energyPricePerUnit: energyPrice,
    maintenancePerKm: maintenance,
    depreciationPerKm: depreciation,
  );
}
