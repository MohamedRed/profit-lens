import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_status.dart';

class HelpTicketStatusChip extends StatelessWidget {
  final HelpTicketStatus status;

  const HelpTicketStatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final color = _statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        _statusLabel(status, l10n),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

Color _statusColor(HelpTicketStatus status) {
  switch (status) {
    case HelpTicketStatus.open:
      return ShadcnColors.teal;
    case HelpTicketStatus.triaging:
      return ShadcnColors.purple;
    case HelpTicketStatus.inProgress:
      return ShadcnColors.pink;
    case HelpTicketStatus.awaitingResponse:
      return ShadcnColors.teal;
    case HelpTicketStatus.resolved:
      return ShadcnColors.textSecondary;
    case HelpTicketStatus.closed:
      return ShadcnColors.textSecondary;
  }
}

String _statusLabel(HelpTicketStatus status, AppLocalizations l10n) {
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
