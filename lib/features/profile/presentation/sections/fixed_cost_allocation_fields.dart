import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/fixed_cost_allocation.dart';

class FixedCostAllocationFields extends StatelessWidget {
  final FixedCostAllocation allocation;
  final ValueChanged<FixedCostAllocation> onAllocationChanged;
  final TextEditingController monthlyHoursController;
  final TextEditingController monthlyDistanceController;
  final TextEditingController monthlyDeliveriesController;

  const FixedCostAllocationFields({
    super.key,
    required this.allocation,
    required this.onAllocationChanged,
    required this.monthlyHoursController,
    required this.monthlyDistanceController,
    required this.monthlyDeliveriesController,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      children: [
        DropdownButtonFormField<FixedCostAllocation>(
          initialValue: allocation,
          decoration: InputDecoration(labelText: l10n.fixedCostAllocationLabel),
          items: FixedCostAllocation.values
              .map(
                (value) => DropdownMenuItem(
                  value: value,
                  child: Text(_allocationLabel(l10n, value)),
                ),
              )
              .toList(),
          onChanged: (value) {
            if (value != null) {
              onAllocationChanged(value);
            }
          },
        ),
        const SizedBox(height: 12),
        if (allocation == FixedCostAllocation.perHour)
          TextFormField(
            controller: monthlyHoursController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(labelText: l10n.monthlyHoursLabel),
          ),
        if (allocation == FixedCostAllocation.perKm)
          TextFormField(
            controller: monthlyDistanceController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(labelText: l10n.monthlyDistanceLabel),
          ),
        if (allocation == FixedCostAllocation.perDelivery)
          TextFormField(
            controller: monthlyDeliveriesController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(labelText: l10n.monthlyDeliveriesLabel),
          ),
      ],
    );
  }

  String _allocationLabel(AppLocalizations l10n, FixedCostAllocation value) {
    switch (value) {
      case FixedCostAllocation.perHour:
        return l10n.fixedCostPerHourLabel;
      case FixedCostAllocation.perKm:
        return l10n.fixedCostPerKmLabel;
      case FixedCostAllocation.perDelivery:
        return l10n.fixedCostPerDeliveryLabel;
    }
  }
}
