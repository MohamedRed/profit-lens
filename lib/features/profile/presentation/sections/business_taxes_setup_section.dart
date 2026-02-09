import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/business_activity.dart';
import 'business_activity_field.dart';
import 'business_taxes_fields.dart';

class BusinessTaxesSetupSection extends StatelessWidget {
  final BusinessActivity activity;
  final ValueChanged<BusinessActivity> onActivityChanged;
  final TextEditingController socialRateController;
  final TextEditingController incomeTaxController;
  final bool useFranceDefaults;
  final ValueChanged<bool> onDefaultsChanged;
  final bool useLiberatoryTax;
  final ValueChanged<bool> onLiberatoryTaxChanged;

  const BusinessTaxesSetupSection({
    super.key,
    required this.activity,
    required this.onActivityChanged,
    required this.socialRateController,
    required this.incomeTaxController,
    required this.useFranceDefaults,
    required this.onDefaultsChanged,
    required this.useLiberatoryTax,
    required this.onLiberatoryTaxChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.costsSection,
      children: [
        BusinessActivityField(value: activity, onChanged: onActivityChanged),
        const SizedBox(height: 12),
        BusinessTaxesFields(
          socialRateController: socialRateController,
          incomeTaxController: incomeTaxController,
          useFranceDefaults: useFranceDefaults,
          onDefaultsChanged: onDefaultsChanged,
          useLiberatoryTax: useLiberatoryTax,
          onLiberatoryTaxChanged: onLiberatoryTaxChanged,
        ),
      ],
    );
  }
}
