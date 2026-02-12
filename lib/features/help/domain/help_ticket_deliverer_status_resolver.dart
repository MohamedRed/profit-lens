import 'help_ticket_deliverer_status.dart';
import 'help_ticket_status.dart';

HelpTicketDelivererStatus resolveHelpTicketDelivererStatus({
  required HelpTicketStatus status,
  String? codingAgentStatus,
  bool? aiNeedsUserAction,
}) {
  final normalizedCodingStatus = (codingAgentStatus ?? '').toLowerCase().trim();

  if (status == HelpTicketStatus.resolved ||
      status == HelpTicketStatus.closed) {
    return HelpTicketDelivererStatus.resolved;
  }

  if (normalizedCodingStatus == 'pr_created') {
    return HelpTicketDelivererStatus.fixReady;
  }

  if (status == HelpTicketStatus.awaitingResponse ||
      aiNeedsUserAction == true ||
      normalizedCodingStatus == 'no_changes') {
    return HelpTicketDelivererStatus.needsInfo;
  }

  if (status == HelpTicketStatus.triaging ||
      status == HelpTicketStatus.inProgress ||
      normalizedCodingStatus == 'queued' ||
      normalizedCodingStatus == 'running' ||
      normalizedCodingStatus == 'failed') {
    return HelpTicketDelivererStatus.analyzing;
  }

  return HelpTicketDelivererStatus.received;
}
