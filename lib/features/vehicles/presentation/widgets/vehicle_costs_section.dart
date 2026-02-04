import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import 'vehicle_maintenance_fields.dart';

class VehicleCostsSection extends StatelessWidget {
  final TextEditingController maintenanceController;
  final TextEditingController depreciationController;
  final VoidCallback onPresetEdited;

  const VehicleCostsSection({
    super.key,
    required this.maintenanceController,
    required this.depreciationController,
    required this.onPresetEdited,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.vehicleCostsSectionTitle,
      children: [
        VehicleMaintenanceFields(
          maintenanceController: maintenanceController,
          depreciationController: depreciationController,
          onMaintenanceChanged: (_) => onPresetEdited(),
          onDepreciationChanged: (_) => onPresetEdited(),
        ),
      ],
    );
  }
}
