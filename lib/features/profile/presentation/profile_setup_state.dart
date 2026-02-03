import 'package:flutter/material.dart';

import '../../vehicles/presentation/controllers/vehicle_form_controller.dart';
import 'controllers/business_profile_controller.dart';

class ProfileSetupState extends ChangeNotifier {
  final BusinessProfileController businessController;
  final VehicleFormController vehicleController;
  bool isSaving = false;
  bool useVehiclePresets;
  bool isLookingUpModel = false;
  bool isLookingUpPlate = false;
  bool isApplyingPresets = false;

  ProfileSetupState()
      : businessController = BusinessProfileController.forSetup(),
        vehicleController = VehicleFormController.fromVehicle(
          vehicle: null,
          useFranceDefaults: true,
        ),
        useVehiclePresets = true {
    useVehiclePresets = businessController.useFranceDefaults;
  }

  @override
  void dispose() {
    businessController.dispose();
    vehicleController.dispose();
    super.dispose();
  }

  void refresh() => notifyListeners();
}
