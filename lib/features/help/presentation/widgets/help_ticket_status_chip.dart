import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_deliverer_status.dart';
import '../help_ticket_status_presentation.dart';

class HelpTicketStatusChip extends StatelessWidget {
  final HelpTicketDelivererStatus status;

  const HelpTicketStatusChip({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final color = helpTicketStatusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        helpTicketStatusLabel(status, l10n),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
