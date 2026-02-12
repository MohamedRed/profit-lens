import '../../../l10n/app_localizations.dart';
import '../domain/help_ticket.dart';

String resolveHelpTicketDisplayTitle({
  required HelpTicket ticket,
  required AppLocalizations l10n,
}) {
  final normalized = ticket.title?.trim() ?? '';
  if (normalized.isNotEmpty) {
    return normalized;
  }
  if (ticket.audioCount > 0 && ticket.description.trim().isEmpty) {
    return l10n.helpTicketAudioHeadline;
  }
  return l10n.helpTicketGeneratedTitleGeneric;
}
