import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket.dart';
import 'help_section_card.dart';

class HelpAiTriageSection extends StatelessWidget {
  final HelpTicket ticket;

  const HelpAiTriageSection({super.key, required this.ticket});

  @override
  Widget build(BuildContext context) {
    final summary = ticket.aiSummary;
    final nextSteps = ticket.aiNextSteps;
    if ((summary == null || summary.isEmpty) &&
        (nextSteps == null || nextSteps.isEmpty)) {
      return const SizedBox.shrink();
    }
    final l10n = AppLocalizations.of(context)!;
    return HelpSectionCard(
      title: l10n.helpAiTriageTitle,
      children: [
        if (summary != null && summary.isNotEmpty) ...[
          Text(
            l10n.helpAiSummaryLabel,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: ShadcnColors.textSecondary,
            ),
          ),
          const SizedBox(height: ShadcnSpacing.xs),
          Text(summary, style: Theme.of(context).textTheme.bodyMedium),
        ],
        if (nextSteps != null && nextSteps.isNotEmpty) ...[
          const SizedBox(height: ShadcnSpacing.lg),
          Text(
            l10n.helpAiNextStepsLabel,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: ShadcnColors.textSecondary,
            ),
          ),
          const SizedBox(height: ShadcnSpacing.xs),
          Text(nextSteps, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ],
    );
  }
}
