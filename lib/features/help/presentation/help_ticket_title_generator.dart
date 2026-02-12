import '../../../l10n/app_localizations.dart';
import '../domain/help_ticket.dart';

const int _maxTitleWords = 7;
const int _maxTitleChars = 52;

String buildHelpTicketTitle({
  required HelpTicket ticket,
  required AppLocalizations l10n,
}) {
  final aiSummary = _normalizeWhitespace(ticket.aiSummary ?? '');
  final description = _normalizeWhitespace(ticket.description);
  final source = aiSummary.isNotEmpty ? aiSummary : description;
  if (source.isEmpty) {
    return ticket.audioCount > 0
        ? l10n.helpTicketAudioHeadline
        : l10n.helpTicketGeneratedTitleGeneric;
  }

  final keywordTitle = _keywordTitle(source.toLowerCase(), l10n);
  if (keywordTitle != null) {
    return keywordTitle;
  }

  final firstSentence = _firstSentence(source);
  if (firstSentence.isEmpty) {
    return l10n.helpTicketGeneratedTitleGeneric;
  }

  return _condenseTitle(firstSentence);
}

String _normalizeWhitespace(String value) {
  return value.replaceAll(RegExp(r'\s+'), ' ').trim();
}

String _firstSentence(String text) {
  final trimmed = text.trim();
  if (trimmed.isEmpty) {
    return '';
  }
  final segments = trimmed.split(RegExp(r'[.!?\n]+'));
  if (segments.isEmpty) {
    return '';
  }
  return segments.first.trim();
}

String _condenseTitle(String sentence) {
  final normalized = _normalizeWhitespace(sentence);
  if (normalized.isEmpty) {
    return '';
  }

  final words = normalized.split(' ').where((word) => word.isNotEmpty).toList();
  if (words.isEmpty) {
    return '';
  }

  if (words.length <= _maxTitleWords && normalized.length <= _maxTitleChars) {
    return normalized;
  }

  final shortWords = words.take(_maxTitleWords).join(' ');
  if (shortWords.length <= _maxTitleChars) {
    return '$shortWords...';
  }

  return '${shortWords.substring(0, _maxTitleChars).trimRight()}...';
}

String? _keywordTitle(String normalized, AppLocalizations l10n) {
  if (RegExp(
    r'\b(abonnement|subscription|plan|premium|forfait)\b',
  ).hasMatch(normalized)) {
    return l10n.helpTicketGeneratedTitleSubscription;
  }
  if (RegExp(
    r'\b(paiement|payment|invoice|facture|card|carte)\b',
  ).hasMatch(normalized)) {
    return l10n.helpTicketGeneratedTitlePayment;
  }
  if (RegExp(
    r'\b(connexion|login|sign in|signin|auth|password|mot de passe)\b',
  ).hasMatch(normalized)) {
    return l10n.helpTicketGeneratedTitleLogin;
  }
  if (RegExp(r'\b(notification|notifi|push)\b').hasMatch(normalized)) {
    return l10n.helpTicketGeneratedTitleNotification;
  }
  if (RegExp(
    r'\b(crash|bug|erreur|error|bloque|blocked|freeze|plant)\b',
  ).hasMatch(normalized)) {
    return l10n.helpTicketGeneratedTitleBug;
  }
  return null;
}
