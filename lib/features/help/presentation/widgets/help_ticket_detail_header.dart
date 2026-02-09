import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket.dart';
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
        color: ShadcnColors.surface,
        borderRadius: BorderRadius.circular(ShadcnRadius.xl),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  _headlineFromDescription(
                    ticket.description,
                    ticket.audioCount,
                    l10n,
                  ),
                  style: Theme.of(context).textTheme.titleMedium,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              HelpTicketStatusChip(status: ticket.status),
            ],
          ),
          const SizedBox(height: ShadcnSpacing.sm),
          Text(
            ticket.statusMessage ?? l10n.helpStatusUpdatedLabel,
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

String _headlineFromDescription(
  String description,
  int audioCount,
  AppLocalizations l10n,
) {
  final trimmed = description.trim();
  if (trimmed.isEmpty) {
    return audioCount > 0 ? l10n.helpTicketAudioHeadline : '';
  }
  final firstLine = trimmed.split('\n').first.trim();
  return firstLine.isEmpty ? trimmed : firstLine;
}
