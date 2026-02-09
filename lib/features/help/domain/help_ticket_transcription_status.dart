enum HelpTicketTranscriptionStatus { pending, completed, failed }

String helpTicketTranscriptionStatusToString(
  HelpTicketTranscriptionStatus status,
) {
  switch (status) {
    case HelpTicketTranscriptionStatus.pending:
      return 'pending';
    case HelpTicketTranscriptionStatus.completed:
      return 'completed';
    case HelpTicketTranscriptionStatus.failed:
      return 'failed';
  }
}

HelpTicketTranscriptionStatus? helpTicketTranscriptionStatusFromString(
  String? value,
) {
  switch (value) {
    case 'pending':
      return HelpTicketTranscriptionStatus.pending;
    case 'completed':
      return HelpTicketTranscriptionStatus.completed;
    case 'failed':
      return HelpTicketTranscriptionStatus.failed;
  }
  return null;
}
