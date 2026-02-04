import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import 'business_taxes_fields.dart';

class BusinessTaxesSection extends StatelessWidget {
  final TextEditingController socialRateController;
  final TextEditingController incomeTaxController;
  final bool useFranceDefaults;
  final ValueChanged<bool> onDefaultsChanged;
  final bool useLiberatoryTax;
  final ValueChanged<bool> onLiberatoryTaxChanged;

  const BusinessTaxesSection({
    super.key,
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
