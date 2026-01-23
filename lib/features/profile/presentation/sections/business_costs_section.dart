import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/fixed_cost_allocation.dart';
import 'business_costs_fields.dart';

class BusinessCostsSection extends StatelessWidget {
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

  const BusinessCostsSection({
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
    return SectionCard(
      title: l10n.costsSection,
      children: [
        BusinessCostsFields(
          socialRateController: socialRateController,
          incomeTaxController: incomeTaxController,
          monthlyFixedCostsController: monthlyFixedCostsController,
          monthlyHoursController: monthlyHoursController,
          monthlyDistanceController: monthlyDistanceController,
          monthlyDeliveriesController: monthlyDeliveriesController,
          allocation: allocation,
          onAllocationChanged: onAllocationChanged,
          useFranceDefaults: useFranceDefaults,
          onDefaultsChanged: onDefaultsChanged,
        ),
      ],
    );
  }
}
