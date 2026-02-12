import 'package:cloud_firestore/cloud_firestore.dart';

import '../domain/help_ticket_deliverer_status.dart';
import '../domain/help_ticket_timeline_event.dart';
import '../domain/help_ticket_timeline_source.dart';

class HelpTicketTimelineMapper {
  HelpTicketTimelineEvent? fromDocument(String id, Map<String, dynamic> data) {
    final status = helpTicketDelivererStatusFromString(
      data['status'] as String?,
    );
    final message = data['message'] as String?;
    final at = (data['at'] as Timestamp?)?.toDate();
    final source = helpTicketTimelineSourceFromString(
      data['source'] as String?,
    );
    if (status == null || message == null || at == null || source == null) {
      return null;
    }
    return HelpTicketTimelineEvent(
      id: id,
      status: status,
      message: message,
      at: at,
      source: source,
    );
  }
}
