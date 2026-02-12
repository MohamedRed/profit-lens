import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_deliverer_status.dart';

class HelpTicketStatusChip extends StatelessWidget {
  final HelpTicketDelivererStatus status;

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

Color _statusColor(HelpTicketDelivererStatus status) {
  switch (status) {
    case HelpTicketDelivererStatus.received:
      return ShadcnColors.teal;
    case HelpTicketDelivererStatus.analyzing:
      return ShadcnColors.pink;
    case HelpTicketDelivererStatus.needsInfo:
      return ShadcnColors.teal;
    case HelpTicketDelivererStatus.fixReady:
      return ShadcnColors.purple;
    case HelpTicketDelivererStatus.resolved:
      return ShadcnColors.textSecondary;
  }
}

String _statusLabel(HelpTicketDelivererStatus status, AppLocalizations l10n) {
  switch (status) {
    case HelpTicketDelivererStatus.received:
      return l10n.helpDelivererStatusReceivedLabel;
    case HelpTicketDelivererStatus.analyzing:
      return l10n.helpDelivererStatusAnalyzingLabel;
    case HelpTicketDelivererStatus.needsInfo:
      return l10n.helpDelivererStatusNeedsInfoLabel;
    case HelpTicketDelivererStatus.fixReady:
      return l10n.helpDelivererStatusFixReadyLabel;
    case HelpTicketDelivererStatus.resolved:
      return l10n.helpDelivererStatusResolvedLabel;
  }
}
