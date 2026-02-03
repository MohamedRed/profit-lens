import 'package:flutter/material.dart';

import '../../../core/widgets/primary_button.dart';
import '../../../features/defaults/data/vehicle_presets_fr.dart';
import '../../../features/defaults/presentation/preset_sources_section.dart';
import '../../../l10n/app_localizations.dart';
import '../domain/energy_type.dart';
import '../domain/fuel_type.dart';
import '../domain/vehicle_type.dart';
import 'controllers/vehicle_form_controller.dart';
import 'controllers/vehicle_form_controller_actions.dart';
import 'widgets/vehicle_section.dart';

class VehicleFormBody extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final VehicleFormController controller;
  final bool useVehiclePresets;
  final ValueChanged<bool> onPresetsChanged;
  final VoidCallback onPresetEdited;
  final VoidCallback? onModelLookup;
  final VoidCallback? onPlateLookup;
  final bool isLookingUpPlate;
  final bool isSaving;
  final VoidCallback onSave;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;

  const VehicleFormBody({
    super.key,
    required this.formKey,
    required this.controller,
    required this.useVehiclePresets,
    required this.onPresetsChanged,
    required this.onPresetEdited,
    required this.onModelLookup,
    required this.onPlateLookup,
    required this.isLookingUpPlate,
    required this.isSaving,
    required this.onSave,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Form(
      key: formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          VehicleSection(
            vehicleType: controller.vehicleType,
            energyType: controller.energyType,
            fuelType: controller.fuelType,
            useVehiclePresets: useVehiclePresets,
            onVehicleTypeChanged: onVehicleTypeChanged,
            onEnergyTypeChanged: onEnergyTypeChanged,
            onFuelTypeChanged: onFuelTypeChanged,
            onPresetsChanged: onPresetsChanged,
            onPresetEdited: onPresetEdited,
            licensePlateController: controller.licensePlateController,
            brandController: controller.brandController,
            modelController: controller.modelController,
            registrationYearController: controller.registrationYearController,
            consumptionController: controller.consumptionController,
            energyPriceController: controller.energyPriceController,
            maintenanceController: controller.maintenanceController,
            depreciationController: controller.depreciationController,
            consumptionSuffix: controller.consumptionSuffix(),
            energyPriceSuffix: controller.energyPriceSuffix(),
            onModelLookup: onModelLookup,
            onPlateLookup: onPlateLookup,
            isLookingUpPlate: isLookingUpPlate,
          ),
          const SizedBox(height: 12),
          PresetSourcesSection(sources: VehiclePresetsFr.sources),
          const SizedBox(height: 16),
          PrimaryButton(
            label: isSaving ? l10n.loadingLabel : l10n.saveVehicleButton,
            onPressed: isSaving ? null : onSave,
          ),
        ],
      ),
    );
  }
}
