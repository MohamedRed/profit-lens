import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../core/widgets/shadcn_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket.dart';
import '../../domain/help_ticket_status.dart';
import 'help_ticket_status_chip.dart';

class HelpTicketCard extends StatelessWidget {
  final HelpTicket ticket;

  const HelpTicketCard({super.key, required this.ticket});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final timestamp = _formatTimestamp(
      context,
      ticket.updatedAt ?? ticket.createdAt,
    );
    return ShadcnCard(
      padding: const EdgeInsets.all(ShadcnSpacing.lg),
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                ticket.title,
                style: Theme.of(context).textTheme.titleSmall,
              ),
            ),
            HelpTicketStatusChip(status: ticket.status),
          ],
        ),
        const SizedBox(height: ShadcnSpacing.sm),
        Text(
          ticket.statusMessage ?? _defaultStatusMessage(l10n, ticket.status),
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: ShadcnColors.textSecondary),
        ),
        const SizedBox(height: ShadcnSpacing.sm),
        Row(
          children: [
            if (ticket.imageCount > 0) ...[
              const Icon(Icons.image_outlined, size: 16),
              const SizedBox(width: 4),
              Text('${ticket.imageCount}'),
              const SizedBox(width: ShadcnSpacing.md),
            ],
            if (ticket.audioCount > 0) ...[
              const Icon(Icons.mic_none, size: 16),
              const SizedBox(width: 4),
              Text('${ticket.audioCount}'),
              const SizedBox(width: ShadcnSpacing.md),
            ],
            if (timestamp != null)
              Text(
                timestamp,
                style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: ShadcnColors.textSecondary,
                ),
              ),
          ],
        ),
      ],
    );
  }
}

String? _formatTimestamp(BuildContext context, DateTime? dateTime) {
  if (dateTime == null) return null;
  final localizations = MaterialLocalizations.of(context);
  return localizations.formatShortDate(dateTime.toLocal());
}

String _defaultStatusMessage(AppLocalizations l10n, HelpTicketStatus status) {
  switch (status) {
    case HelpTicketStatus.open:
      return l10n.helpStatusOpen;
    case HelpTicketStatus.triaging:
      return l10n.helpStatusTriaging;
    case HelpTicketStatus.inProgress:
      return l10n.helpStatusInProgress;
    case HelpTicketStatus.awaitingResponse:
      return l10n.helpStatusAwaitingResponse;
    case HelpTicketStatus.resolved:
      return l10n.helpStatusResolved;
    case HelpTicketStatus.closed:
      return l10n.helpStatusClosed;
  }
}
