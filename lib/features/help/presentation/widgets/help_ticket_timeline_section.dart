import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_timeline_event.dart';
import '../help_ticket_status_presentation.dart';

class HelpTicketTimelineSection extends StatelessWidget {
  final List<HelpTicketTimelineEvent> events;

  const HelpTicketTimelineSection({super.key, required this.events});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (events.isEmpty) {
      return Text(
        l10n.helpTicketTimelineEmpty,
        style: Theme.of(
          context,
        ).textTheme.bodyMedium?.copyWith(color: ShadcnColors.textSecondary),
      );
    }

    return Column(
      children: [
        for (var i = 0; i < events.length; i++) ...[
          _TimelineEventTile(event: events[i]),
          if (i != events.length - 1) const SizedBox(height: ShadcnSpacing.md),
        ],
      ],
    );
  }
}

class _TimelineEventTile extends StatelessWidget {
  final HelpTicketTimelineEvent event;

  const _TimelineEventTile({required this.event});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final color = helpTicketStatusColor(event.status);
    final localizations = MaterialLocalizations.of(context);
    final localDateTime = event.at.toLocal();
    final date = localizations.formatShortDate(localDateTime);
    final time = localizations.formatTimeOfDay(
      TimeOfDay.fromDateTime(localDateTime),
      alwaysUse24HourFormat: true,
    );

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
        ),
        const SizedBox(width: ShadcnSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                helpTicketStatusLabel(event.status, l10n),
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: ShadcnColors.textPrimary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: ShadcnSpacing.xs),
              Text(
                '${l10n.helpTicketTimelineAtLabel} $date $time',
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: ShadcnColors.textSecondary,
                ),
              ),
              const SizedBox(height: ShadcnSpacing.xs),
              Text(
                event.message,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: ShadcnColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
