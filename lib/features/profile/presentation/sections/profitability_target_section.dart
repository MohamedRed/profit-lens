import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';

class ProfitabilityTargetSection extends StatelessWidget {
  final TextEditingController minProfitabilityController;

  const ProfitabilityTargetSection({
    super.key,
    required this.minProfitabilityController,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.profitabilityTargetTitle,
      children: [
        TextFormField(
          controller: minProfitabilityController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(
            labelText: l10n.minProfitabilityLabel,
            suffixText: '€',
            helperText: l10n.minProfitabilityHint,
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
      ],
    );
  }
}
