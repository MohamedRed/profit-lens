import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket.dart';
import '../../domain/help_ticket_deliverer_status.dart';
import '../help_ticket_display_title.dart';
import 'help_ticket_status_chip.dart';

class HelpTicketDetailHeader extends StatelessWidget {
  final HelpTicket ticket;

  const HelpTicketDetailHeader({super.key, required this.ticket});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final timestamp = _formatTimestamp(
      context,
      ticket.updatedAt ?? ticket.createdAt,
    );
    return Container(
      padding: const EdgeInsets.all(ShadcnSpacing.lg),
      decoration: BoxDecoration(
        color: ShadcnColors.background,
        borderRadius: BorderRadius.circular(ShadcnRadius.xl),
        border: Border.all(color: ShadcnColors.outline),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  resolveHelpTicketDisplayTitle(ticket: ticket, l10n: l10n),
                  style: Theme.of(context).textTheme.titleMedium,
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
          if (timestamp != null) ...[
            const SizedBox(height: ShadcnSpacing.sm),
            Text(
              timestamp,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: ShadcnColors.textSecondary,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

String? _formatTimestamp(BuildContext context, DateTime? dateTime) {
  if (dateTime == null) return null;
  final localizations = MaterialLocalizations.of(context);
  return localizations.formatFullDate(dateTime.toLocal());
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
