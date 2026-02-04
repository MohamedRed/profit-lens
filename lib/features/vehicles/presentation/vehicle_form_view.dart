import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../domain/energy_type.dart';
import '../domain/fuel_type.dart';
import '../domain/vehicle_type.dart';
import 'controllers/vehicle_form_controller.dart';
import 'vehicle_form_body.dart';

class VehicleFormView extends StatelessWidget {
  final String title;
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
  final VoidCallback? onDelete;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;

  const VehicleFormView({
    super.key,
    required this.title,
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
    required this.onDelete,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: [
          if (onDelete != null)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              tooltip: l10n.deleteVehicleAction,
              onPressed: onDelete,
            ),
        ],
      ),
      body: SafeArea(
        child: VehicleFormBody(
          formKey: formKey,
          controller: controller,
          useVehiclePresets: useVehiclePresets,
          onPresetsChanged: onPresetsChanged,
          onPresetEdited: onPresetEdited,
          onModelLookup: onModelLookup,
          onPlateLookup: onPlateLookup,
          isLookingUpPlate: isLookingUpPlate,
          isSaving: isSaving,
          onSave: onSave,
          onVehicleTypeChanged: onVehicleTypeChanged,
          onEnergyTypeChanged: onEnergyTypeChanged,
          onFuelTypeChanged: onFuelTypeChanged,
        ),
      ),
    );
  }
}
