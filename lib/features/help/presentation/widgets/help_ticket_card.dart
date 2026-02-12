import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../core/widgets/shadcn_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket.dart';
import '../../domain/help_ticket_deliverer_status.dart';
import '../help_ticket_title_generator.dart';
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
                buildHelpTicketTitle(ticket: ticket, l10n: l10n),
                style: Theme.of(context).textTheme.titleSmall,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            HelpTicketStatusChip(status: ticket.delivererStatus),
          ],
        ),
        const SizedBox(height: ShadcnSpacing.sm),
        Text(
          ticket.delivererStatusMessage ??
              _defaultDelivererStatusMessage(l10n, ticket.delivererStatus),
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

String _defaultDelivererStatusMessage(
  AppLocalizations l10n,
  HelpTicketDelivererStatus status,
) {
  switch (status) {
    case HelpTicketDelivererStatus.received:
      return l10n.helpDelivererStatusReceivedMessage;
    case HelpTicketDelivererStatus.analyzing:
      return l10n.helpDelivererStatusAnalyzingMessage;
    case HelpTicketDelivererStatus.needsInfo:
      return l10n.helpDelivererStatusNeedsInfoMessage;
    case HelpTicketDelivererStatus.fixReady:
      return l10n.helpDelivererStatusFixReadyMessage;
    case HelpTicketDelivererStatus.resolved:
      return l10n.helpDelivererStatusResolvedMessage;
  }
}
