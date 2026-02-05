import 'package:flutter/material.dart';
import '../../profile/domain/business_activity.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import '../../vehicles/domain/energy_type.dart';
import '../../vehicles/domain/fuel_type.dart';
import '../../vehicles/domain/vehicle_type.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller.dart';
import 'controllers/business_profile_controller.dart';
import 'profile_setup_sources_section.dart';
import 'profile_setup_stepper.dart';

class ProfileSetupView extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final BusinessProfileController businessController;
  final VehicleFormController vehicleController;
  final bool isSaving;
  final bool useVehiclePresets;
  final ValueChanged<bool> onVehiclePresetsChanged;
  final VoidCallback onVehiclePresetEdited;
  final VoidCallback? onModelLookup;
  final VoidCallback? onPlateLookup;
  final bool isLookingUpPlate;
  final ValueChanged<BusinessActivity> onActivityChanged;
  final ValueChanged<FixedCostAllocation> onAllocationChanged;
  final ValueChanged<bool> onDefaultsChanged;
  final ValueChanged<bool> onLiberatoryTaxChanged;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;
  final VoidCallback onSave;
  const ProfileSetupView({
    super.key,
    required this.formKey, required this.businessController,
    required this.vehicleController, required this.isSaving,
    required this.useVehiclePresets, required this.onVehiclePresetsChanged,
    required this.onVehiclePresetEdited, required this.onModelLookup,
    required this.onPlateLookup, required this.isLookingUpPlate,
    required this.onActivityChanged, required this.onAllocationChanged,
    required this.onDefaultsChanged, required this.onLiberatoryTaxChanged,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged, required this.onFuelTypeChanged,
    required this.onSave,
  });
  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: LayoutBuilder(
        builder: (context, constraints) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            SizedBox(
              height: constraints.maxHeight,
              child: ProfileSetupStepper(
                businessController: businessController,
                vehicleController: vehicleController,
                isSaving: isSaving,
                useVehiclePresets: useVehiclePresets,
                onVehiclePresetsChanged: onVehiclePresetsChanged,
                onVehiclePresetEdited: onVehiclePresetEdited,
                onModelLookup: onModelLookup,
                onPlateLookup: onPlateLookup,
                isLookingUpPlate: isLookingUpPlate,
                onActivityChanged: onActivityChanged,
                onAllocationChanged: onAllocationChanged,
                onDefaultsChanged: onDefaultsChanged,
                onLiberatoryTaxChanged: onLiberatoryTaxChanged,
                onVehicleTypeChanged: onVehicleTypeChanged,
                onEnergyTypeChanged: onEnergyTypeChanged,
                onFuelTypeChanged: onFuelTypeChanged,
                onSave: onSave,
              ),
            ),
            const SizedBox(height: 12),
            const ProfileSetupSourcesSection(),
          ],
        ),
      ),
    );
  }

}
