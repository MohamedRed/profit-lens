enum HelpTicketDelivererStatus {
  received,
  analyzing,
  needsInfo,
  fixReady,
  resolved,
}

String helpTicketDelivererStatusToString(HelpTicketDelivererStatus status) {
  switch (status) {
    case HelpTicketDelivererStatus.received:
      return 'received';
    case HelpTicketDelivererStatus.analyzing:
      return 'analyzing';
    case HelpTicketDelivererStatus.needsInfo:
      return 'needs_info';
    case HelpTicketDelivererStatus.fixReady:
      return 'fix_ready';
    case HelpTicketDelivererStatus.resolved:
      return 'resolved';
  }
}

HelpTicketDelivererStatus? helpTicketDelivererStatusFromString(String? value) {
  switch (value) {
    case 'received':
      return HelpTicketDelivererStatus.received;
    case 'analyzing':
      return HelpTicketDelivererStatus.analyzing;
    case 'needs_info':
      return HelpTicketDelivererStatus.needsInfo;
    case 'fix_ready':
      return HelpTicketDelivererStatus.fixReady;
    case 'resolved':
      return HelpTicketDelivererStatus.resolved;
  }
  return null;
}
