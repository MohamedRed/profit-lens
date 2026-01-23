import 'package:flutter/material.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../features/defaults/data/france_defaults.dart';
import '../../../features/defaults/presentation/preset_sources_section.dart';
import '../../../l10n/app_localizations.dart';
import '../../profile/domain/business_activity.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import '../../vehicles/domain/energy_type.dart';
import '../../vehicles/domain/fuel_type.dart';
import '../../vehicles/domain/vehicle_type.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller.dart';
import '../../vehicles/presentation/widgets/vehicle_section.dart';
import 'controllers/business_profile_controller.dart';
import 'sections/business_costs_section.dart';
import 'sections/business_activity_field.dart';
class ProfileSetupView extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final BusinessProfileController businessController;
  final VehicleFormController vehicleController;
  final bool isSaving;
  final ValueChanged<BusinessActivity> onActivityChanged;
  final ValueChanged<FixedCostAllocation> onAllocationChanged;
  final ValueChanged<bool> onDefaultsChanged;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;
  final VoidCallback onSave;

  const ProfileSetupView({
    super.key,
    required this.formKey,
    required this.businessController,
    required this.vehicleController,
    required this.isSaving,
    required this.onActivityChanged,
    required this.onAllocationChanged,
    required this.onDefaultsChanged,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
    required this.onSave,
  });
  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Form(
      key: formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          BusinessActivityField(
            value: businessController.activity,
            onChanged: onActivityChanged,
          ),
          const SizedBox(height: 12),
          BusinessCostsSection(
            socialRateController: businessController.socialRateController,
            incomeTaxController: businessController.incomeTaxController,
            monthlyFixedCostsController:
                businessController.monthlyFixedCostsController,
            monthlyHoursController: businessController.monthlyHoursController,
            monthlyDistanceController:
                businessController.monthlyDistanceController,
            monthlyDeliveriesController:
                businessController.monthlyDeliveriesController,
            allocation: businessController.allocation,
            onAllocationChanged: onAllocationChanged,
            useFranceDefaults: businessController.useFranceDefaults,
            onDefaultsChanged: onDefaultsChanged,
          ),
          const SizedBox(height: 12),
          VehicleSection(
            vehicleType: vehicleController.vehicleType,
            energyType: vehicleController.energyType,
            fuelType: vehicleController.fuelType,
            onVehicleTypeChanged: onVehicleTypeChanged,
            onEnergyTypeChanged: onEnergyTypeChanged,
            onFuelTypeChanged: onFuelTypeChanged,
            nameController: vehicleController.nameController,
            consumptionController: vehicleController.consumptionController,
            energyPriceController: vehicleController.energyPriceController,
            maintenanceController: vehicleController.maintenanceController,
            depreciationController: vehicleController.depreciationController,
            consumptionSuffix: vehicleController.consumptionSuffix(),
            energyPriceSuffix: vehicleController.energyPriceSuffix(),
          ),
          const SizedBox(height: 12),
          PresetSourcesSection(sources: FranceDefaults.sources),
          const SizedBox(height: 16),
          PrimaryButton(
            label: isSaving ? l10n.loadingLabel : l10n.saveProfileButton,
            onPressed: isSaving ? null : onSave,
          ),
        ],
      ),
    );
  }

}
