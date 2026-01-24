import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';

class VehicleEnergyFields extends StatelessWidget {
  final TextEditingController consumptionController;
  final TextEditingController energyPriceController;
  final String consumptionSuffix;
  final String energyPriceSuffix;
  final ValueChanged<String>? onConsumptionChanged;

  const VehicleEnergyFields({
    super.key,
    required this.consumptionController,
    required this.energyPriceController,
    required this.consumptionSuffix,
    required this.energyPriceSuffix,
    this.onConsumptionChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        TextFormField(
          controller: consumptionController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: l10n.consumptionLabel,
            suffixText: consumptionSuffix,
          ),
          onChanged: onConsumptionChanged,
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
      ],
    );
  }
}
