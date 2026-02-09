import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../data/vehicle_model_lookup_service.dart';
import '../domain/energy_type.dart';
import 'controllers/vehicle_form_controller.dart';
import 'controllers/vehicle_form_controller_actions.dart';

Future<void> lookupVehicleModel({
  required BuildContext context,
  required VehicleFormController controller,
  required VehicleModelLookupService service,
  required EnergyType energyType,
  required VoidCallback onApplyStart,
  required VoidCallback onApplyEnd,
}) async {
  final brand = controller.brandController.text.trim();
  final model = controller.modelController.text.trim();
  if (brand.isEmpty || model.isEmpty || energyType == EnergyType.none) {
    return;
  }
  final l10n = AppLocalizations.of(context)!;
  try {
    final result = await service.lookup(
      brand: brand,
      model: model,
      energyType: energyType,
    );
    if (!context.mounted) return;
    if (result == null) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.modelLookupNotFoundMessage)));
      return;
    }
    onApplyStart();
    controller.applyModelConsumption(result.consumptionPer100Km);
    onApplyEnd();
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(l10n.modelLookupAppliedMessage)));
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(l10n.modelLookupFailedMessage)));
  }
}
