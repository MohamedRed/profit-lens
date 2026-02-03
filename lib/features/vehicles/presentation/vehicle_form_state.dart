import 'package:flutter/material.dart';

import '../../profile/domain/user_profile.dart';
import '../domain/vehicle_profile.dart';
import 'controllers/vehicle_form_controller.dart';

class VehicleFormState extends ChangeNotifier {
  final UserProfile profile;
  final VehicleProfile? existing;
  final VehicleFormController controller;
  bool isSaving = false;
  bool useVehiclePresets;
  bool isLookingUpModel = false;
  bool isLookingUpPlate = false;
  bool isApplyingPresets = false;

  VehicleFormState({
    required this.profile,
    required this.existing,
  })  : controller = VehicleFormController.fromVehicle(
          vehicle: existing,
          useFranceDefaults: profile.useFranceDefaults,
        ),
        useVehiclePresets = existing == null ? profile.useFranceDefaults : false;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void refresh() => notifyListeners();
}
