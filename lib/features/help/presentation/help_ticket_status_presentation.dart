import 'package:flutter/material.dart';

import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import '../domain/help_ticket_deliverer_status.dart';

Color helpTicketStatusColor(HelpTicketDelivererStatus status) {
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

String helpTicketStatusLabel(
  HelpTicketDelivererStatus status,
  AppLocalizations l10n,
) {
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
