import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/fixed_cost_allocation.dart';
import 'business_fixed_costs_fields.dart';

class BusinessFixedCostsSection extends StatelessWidget {
  final TextEditingController monthlyFixedCostsController;
  final TextEditingController monthlyHoursController;
  final TextEditingController monthlyDistanceController;
  final TextEditingController monthlyDeliveriesController;
  final FixedCostAllocation allocation;
  final ValueChanged<FixedCostAllocation> onAllocationChanged;

  const BusinessFixedCostsSection({
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
    return SectionCard(
      title: l10n.monthlyCostsSectionTitle,
      children: [
        BusinessFixedCostsFields(
          monthlyFixedCostsController: monthlyFixedCostsController,
          monthlyHoursController: monthlyHoursController,
          monthlyDistanceController: monthlyDistanceController,
          monthlyDeliveriesController: monthlyDeliveriesController,
          allocation: allocation,
          onAllocationChanged: onAllocationChanged,
        ),
      ],
    );
  }
}
