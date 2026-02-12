import 'help_ticket_deliverer_status.dart';
import 'help_ticket_timeline_source.dart';

class HelpTicketTimelineEvent {
  final String id;
  final HelpTicketDelivererStatus status;
  final String message;
  final DateTime at;
  final HelpTicketTimelineSource source;

  const HelpTicketTimelineEvent({
    required this.id,
    required this.status,
    required this.message,
    required this.at,
    required this.source,
  });
}
