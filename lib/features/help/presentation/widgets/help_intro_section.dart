import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';

class HelpIntroSection extends StatelessWidget {
  const HelpIntroSection({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.helpIntroTitle,
      backgroundColor: ShadcnColors.background,
      borderColor: ShadcnColors.outline,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.support_agent, color: ShadcnColors.purple),
            const SizedBox(width: ShadcnSpacing.md),
            Expanded(
              child: Text(
                l10n.helpIntroBody,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
