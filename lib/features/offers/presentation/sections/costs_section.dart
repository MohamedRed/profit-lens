import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';

class CostsSection extends StatelessWidget {
  final TextEditingController socialRateController;
  final bool useFranceDefaults;
  final ValueChanged<bool> onDefaultsChanged;

  const CostsSection({
    super.key,
    required this.socialRateController,
    required this.useFranceDefaults,
    required this.onDefaultsChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.costsSection,
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
              return l10n.socialRateLabel;
            }
            return null;
          },
        ),
      ],
    );
  }
}
