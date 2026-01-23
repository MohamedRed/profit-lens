import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/fixed_cost_allocation.dart';
import 'fixed_cost_allocation_fields.dart';

class BusinessCostsFields extends StatelessWidget {
  final TextEditingController socialRateController;
  final TextEditingController incomeTaxController;
  final TextEditingController monthlyFixedCostsController;
  final TextEditingController monthlyHoursController;
  final TextEditingController monthlyDistanceController;
  final TextEditingController monthlyDeliveriesController;
  final FixedCostAllocation allocation;
  final ValueChanged<FixedCostAllocation> onAllocationChanged;
  final bool useFranceDefaults;
  final ValueChanged<bool> onDefaultsChanged;

  const BusinessCostsFields({
    super.key,
    required this.socialRateController,
    required this.incomeTaxController,
    required this.monthlyFixedCostsController,
    required this.monthlyHoursController,
    required this.monthlyDistanceController,
    required this.monthlyDeliveriesController,
    required this.allocation,
    required this.onAllocationChanged,
    required this.useFranceDefaults,
    required this.onDefaultsChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        SwitchListTile.adaptive(
          value: useFranceDefaults,
          onChanged: onDefaultsChanged,
          title: Text(l10n.useFranceDefaultsLabel),
          contentPadding: EdgeInsets.zero,
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: socialRateController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: l10n.socialRateLabel,
            suffixText: '%',
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: incomeTaxController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: l10n.incomeTaxRateLabel,
            suffixText: '%',
          ),
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: monthlyFixedCostsController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.monthlyFixedCostsLabel),
        ),
        const SizedBox(height: 12),
        FixedCostAllocationFields(
          allocation: allocation,
          onAllocationChanged: onAllocationChanged,
          monthlyHoursController: monthlyHoursController,
          monthlyDistanceController: monthlyDistanceController,
          monthlyDeliveriesController: monthlyDeliveriesController,
        ),
      ],
    );
  }
}
