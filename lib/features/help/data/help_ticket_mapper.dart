import 'package:cloud_firestore/cloud_firestore.dart';

import '../domain/help_ticket.dart';
import '../domain/help_ticket_status.dart';

class HelpTicketMapper {
  HelpTicket? fromDocument(String id, Map<String, dynamic> data) {
    final description = data['description'] as String?;
    if (description == null) return null;
    final status =
        helpTicketStatusFromString(data['status'] as String?) ??
        HelpTicketStatus.open;
    return HelpTicket(
      id: id,
      description: description,
      status: status,
      statusMessage: data['statusMessage'] as String?,
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
      imageCount: (data['imageCount'] as num?)?.toInt() ?? 0,
      audioCount: (data['audioCount'] as num?)?.toInt() ?? 0,
      aiSummary: data['aiSummary'] as String?,
      aiNextSteps: data['aiNextSteps'] as String?,
      aiConfidence: (data['aiConfidence'] as num?)?.toDouble(),
      aiNeedsUserAction: data['aiNeedsUserAction'] as bool?,
    );
  }
}
