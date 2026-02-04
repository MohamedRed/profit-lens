import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/energy_type.dart';
import '../../domain/fuel_type.dart';
import '../../domain/vehicle_type.dart';
import 'energy_type_field.dart';
import 'fuel_type_field.dart';
import 'vehicle_energy_fields.dart';

class VehicleEnergySection extends StatelessWidget {
  final VehicleType vehicleType;
  final EnergyType energyType;
  final FuelType? fuelType;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;
  final VoidCallback onPresetEdited;
  final TextEditingController consumptionController;
  final TextEditingController energyPriceController;
  final String consumptionSuffix;
  final String energyPriceSuffix;

  const VehicleEnergySection({
    super.key,
    required this.vehicleType,
    required this.energyType,
    required this.fuelType,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
    required this.onPresetEdited,
    required this.consumptionController,
    required this.energyPriceController,
    required this.consumptionSuffix,
    required this.energyPriceSuffix,
  });

  @override
  Widget build(BuildContext context) {
    if (vehicleType == VehicleType.bike) {
      return const SizedBox.shrink();
    }
    final l10n = AppLocalizations.of(context)!;
    final showEnergyType =
        vehicleType == VehicleType.car || vehicleType == VehicleType.scooter;
    final showFuelType = showEnergyType && energyType == EnergyType.fuel;
    return SectionCard(
      title: l10n.vehicleEnergySectionTitle,
      children: [
        if (showEnergyType) ...[
          EnergyTypeField(
            value: energyType,
            onChanged: onEnergyTypeChanged,
          ),
          const SizedBox(height: 12),
        ],
        if (showFuelType) ...[
          FuelTypeField(
            value: fuelType,
            onChanged: onFuelTypeChanged,
          ),
          const SizedBox(height: 12),
        ],
        VehicleEnergyFields(
          consumptionController: consumptionController,
          energyPriceController: energyPriceController,
          consumptionSuffix: consumptionSuffix,
          energyPriceSuffix: energyPriceSuffix,
          onConsumptionChanged: (_) => onPresetEdited(),
        ),
      ],
    );
  }
}
