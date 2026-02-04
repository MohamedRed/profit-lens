import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';

class BusinessTaxesFields extends StatelessWidget {
  final TextEditingController socialRateController;
  final TextEditingController incomeTaxController;
  final bool useFranceDefaults;
  final ValueChanged<bool> onDefaultsChanged;
  final bool useLiberatoryTax;
  final ValueChanged<bool> onLiberatoryTaxChanged;

  const BusinessTaxesFields({
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
        SwitchListTile.adaptive(
          value: useLiberatoryTax,
          onChanged: onLiberatoryTaxChanged,
          title: Text(l10n.liberatoryTaxLabel),
          subtitle: Text(l10n.liberatoryTaxHint),
          contentPadding: EdgeInsets.zero,
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: incomeTaxController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: l10n.incomeTaxRateLabel,
            suffixText: '%',
            helperText: l10n.incomeTaxEstimatedHint,
          ),
        ),
      ],
    );
  }
}
