import 'package:flutter/material.dart';

import '../../../core/widgets/primary_button.dart';
import '../../../features/defaults/data/france_defaults.dart';
import '../../../features/defaults/presentation/preset_sources_section.dart';
import '../../../l10n/app_localizations.dart';
import '../../profile/domain/fixed_cost_allocation.dart';
import '../../profile/domain/business_activity.dart';
import 'controllers/business_profile_controller.dart';
import 'sections/business_fixed_costs_section.dart';
import 'sections/business_taxes_section.dart';
import 'sections/business_activity_field.dart';

class ProfileEditView extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final BusinessProfileController controller;
  final bool isSaving;
  final ValueChanged<BusinessActivity> onActivityChanged;
  final ValueChanged<FixedCostAllocation> onAllocationChanged;
  final ValueChanged<bool> onDefaultsChanged;
  final ValueChanged<bool> onLiberatoryTaxChanged;
  final VoidCallback onSave;

  const ProfileEditView({
    super.key,
    required this.formKey,
    required this.controller,
    required this.isSaving,
    required this.onActivityChanged,
    required this.onAllocationChanged,
    required this.onDefaultsChanged,
    required this.onLiberatoryTaxChanged,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Form(
      key: formKey,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          BusinessActivityField(
            value: controller.activity,
            onChanged: onActivityChanged,
          ),
          const SizedBox(height: 12),
          BusinessTaxesSection(
            socialRateController: controller.socialRateController,
            incomeTaxController: controller.incomeTaxController,
            useFranceDefaults: controller.useFranceDefaults,
            onDefaultsChanged: onDefaultsChanged,
            useLiberatoryTax: controller.useLiberatoryTax,
            onLiberatoryTaxChanged: onLiberatoryTaxChanged,
          ),
          const SizedBox(height: 12),
          BusinessFixedCostsSection(
            monthlyFixedCostsController: controller.monthlyFixedCostsController,
            monthlyHoursController: controller.monthlyHoursController,
            monthlyDistanceController: controller.monthlyDistanceController,
            monthlyDeliveriesController: controller.monthlyDeliveriesController,
            allocation: controller.allocation,
            onAllocationChanged: onAllocationChanged,
          ),
          const SizedBox(height: 12),
          PresetSourcesSection(sources: FranceDefaults.sources),
          const SizedBox(height: 16),
          PrimaryButton(
            label: isSaving ? l10n.loadingLabel : l10n.saveProfileButton,
            onPressed: isSaving ? null : onSave,
          ),
        ],
      ),
    );
  }
}
