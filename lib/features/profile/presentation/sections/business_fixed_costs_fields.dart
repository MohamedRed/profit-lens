import 'package:flutter/material.dart';

import '../../domain/fixed_cost_allocation.dart';
import '../../../../l10n/app_localizations.dart';
import 'fixed_cost_allocation_fields.dart';

class BusinessFixedCostsFields extends StatelessWidget {
  final TextEditingController monthlyFixedCostsController;
  final TextEditingController monthlyHoursController;
  final TextEditingController monthlyDistanceController;
  final TextEditingController monthlyDeliveriesController;
  final FixedCostAllocation allocation;
  final ValueChanged<FixedCostAllocation> onAllocationChanged;

  const BusinessFixedCostsFields({
    super.key,
    required this.monthlyFixedCostsController,
    required this.monthlyHoursController,
    required this.monthlyDistanceController,
    required this.monthlyDeliveriesController,
    required this.allocation,
    required this.onAllocationChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
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
