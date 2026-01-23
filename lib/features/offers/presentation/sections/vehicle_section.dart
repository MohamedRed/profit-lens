import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../features/vehicles/domain/energy_type.dart';
import '../../../../features/vehicles/domain/fuel_type.dart';
import '../../../../features/vehicles/domain/vehicle_type.dart';
import '../../../../l10n/app_localizations.dart';

class VehicleSection extends StatelessWidget {
  final VehicleType vehicleType;
  final EnergyType energyType;
  final FuelType? fuelType;
  final ValueChanged<VehicleType> onVehicleTypeChanged;
  final ValueChanged<EnergyType> onEnergyTypeChanged;
  final ValueChanged<FuelType?> onFuelTypeChanged;
  final TextEditingController consumptionController;
  final TextEditingController energyPriceController;
  final TextEditingController maintenanceController;
  final TextEditingController depreciationController;
  final String consumptionSuffix;
  final String energyPriceSuffix;

  const VehicleSection({
    super.key,
    required this.vehicleType,
    required this.energyType,
    required this.fuelType,
    required this.onVehicleTypeChanged,
    required this.onEnergyTypeChanged,
    required this.onFuelTypeChanged,
    required this.consumptionController,
    required this.energyPriceController,
    required this.maintenanceController,
    required this.depreciationController,
    required this.consumptionSuffix,
    required this.energyPriceSuffix,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.vehicleSection,
      children: [
        DropdownButtonFormField<VehicleType>(
          initialValue: vehicleType,
          decoration: InputDecoration(labelText: l10n.vehicleTypeLabel),
          items: VehicleType.values
              .map((type) => DropdownMenuItem(
                    value: type,
                    child: Text(_vehicleTypeLabel(l10n, type)),
                  ))
              .toList(),
          onChanged: (value) {
            if (value != null) {
              onVehicleTypeChanged(value);
            }
          },
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<EnergyType>(
          initialValue: energyType,
          decoration: InputDecoration(labelText: l10n.energyTypeLabel),
          items: EnergyType.values
              .map((type) => DropdownMenuItem(
                    value: type,
                    child: Text(_energyTypeLabel(l10n, type)),
                  ))
              .toList(),
          onChanged: (value) {
            if (value != null) {
              onEnergyTypeChanged(value);
            }
          },
        ),
        if (energyType == EnergyType.fuel) ...[
          const SizedBox(height: 12),
          DropdownButtonFormField<FuelType>(
            key: ValueKey(fuelType),
            initialValue: fuelType,
            decoration: InputDecoration(labelText: l10n.fuelTypeLabel),
            items: FuelType.values
                .map((type) => DropdownMenuItem(
                      value: type,
                      child: Text(_fuelTypeLabel(l10n, type)),
                    ))
                .toList(),
            onChanged: onFuelTypeChanged,
          ),
        ],
        const SizedBox(height: 12),
        TextFormField(
          controller: consumptionController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: l10n.consumptionLabel,
            suffixText: consumptionSuffix,
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.consumptionLabel;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: energyPriceController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: l10n.energyPriceLabel,
            suffixText: energyPriceSuffix,
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.energyPriceLabel;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: maintenanceController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.maintenanceLabel),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: depreciationController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.depreciationLabel),
        ),
      ],
    );
  }

  String _vehicleTypeLabel(AppLocalizations l10n, VehicleType type) {
    switch (type) {
      case VehicleType.bike:
        return l10n.vehicleTypeBike;
      case VehicleType.ebike:
        return l10n.vehicleTypeEBike;
      case VehicleType.scooter:
        return l10n.vehicleTypeScooter;
      case VehicleType.car:
        return l10n.vehicleTypeCar;
    }
  }

  String _energyTypeLabel(AppLocalizations l10n, EnergyType type) {
    switch (type) {
      case EnergyType.none:
        return l10n.energyTypeNone;
      case EnergyType.electric:
        return l10n.energyTypeElectric;
      case EnergyType.fuel:
        return l10n.energyTypeFuel;
    }
  }

  String _fuelTypeLabel(AppLocalizations l10n, FuelType type) {
    switch (type) {
      case FuelType.e10:
        return l10n.fuelTypeE10;
      case FuelType.sp95:
        return l10n.fuelTypeSP95;
      case FuelType.sp98:
        return l10n.fuelTypeSP98;
      case FuelType.gazole:
        return l10n.fuelTypeGazole;
      case FuelType.e85:
        return l10n.fuelTypeE85;
      case FuelType.gplc:
        return l10n.fuelTypeGPLc;
    }
  }
}
