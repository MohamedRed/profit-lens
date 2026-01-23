import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';

class OfferDetailsSection extends StatelessWidget {
  final TextEditingController payoutController;
  final TextEditingController distanceController;

  const OfferDetailsSection({
    super.key,
    required this.payoutController,
    required this.distanceController,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.offerDetailsSection,
      children: [
        TextFormField(
          controller: payoutController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.offerAmountLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.offerAmountLabel;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: distanceController,
          keyboardType: const TextInputType.numberWithOptions(decimal: true),
          decoration: InputDecoration(labelText: l10n.distanceKmLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.distanceKmLabel;
            }
            return null;
          },
        ),
      ],
    );
  }
}
