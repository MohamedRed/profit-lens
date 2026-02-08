enum HelpTicketStatus {
  open,
  triaging,
  inProgress,
  awaitingResponse,
  resolved,
  closed,
}

String helpTicketStatusToString(HelpTicketStatus status) {
  switch (status) {
    case HelpTicketStatus.open:
      return 'open';
    case HelpTicketStatus.triaging:
      return 'triaging';
    case HelpTicketStatus.inProgress:
      return 'in_progress';
    case HelpTicketStatus.awaitingResponse:
      return 'awaiting_response';
    case HelpTicketStatus.resolved:
      return 'resolved';
    case HelpTicketStatus.closed:
      return 'closed';
  }
}

HelpTicketStatus? helpTicketStatusFromString(String? value) {
  switch (value) {
    case 'open':
      return HelpTicketStatus.open;
    case 'triaging':
      return HelpTicketStatus.triaging;
    case 'in_progress':
      return HelpTicketStatus.inProgress;
    case 'awaiting_response':
      return HelpTicketStatus.awaitingResponse;
    case 'resolved':
      return HelpTicketStatus.resolved;
    case 'closed':
      return HelpTicketStatus.closed;
  }
  return null;
}
