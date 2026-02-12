import 'package:cloud_firestore/cloud_firestore.dart';

import '../domain/help_ticket.dart';
import '../domain/help_ticket_deliverer_status.dart';
import '../domain/help_ticket_deliverer_status_resolver.dart';
import '../domain/help_ticket_status.dart';
import '../domain/help_ticket_transcription_status.dart';

class HelpTicketMapper {
  HelpTicket? fromDocument(String id, Map<String, dynamic> data) {
    final description = data['description'] as String?;
    if (description == null) return null;
    final status =
        helpTicketStatusFromString(data['status'] as String?) ??
        HelpTicketStatus.open;
    final delivererStatus =
        helpTicketDelivererStatusFromString(
          data['delivererStatus'] as String?,
        ) ??
        resolveHelpTicketDelivererStatus(
          status: status,
          codingAgentStatus: data['codingAgentStatus'] as String?,
          aiNeedsUserAction: data['aiNeedsUserAction'] as bool?,
        );
    return HelpTicket(
      id: id,
      description: description,
      status: status,
      statusMessage: data['statusMessage'] as String?,
      delivererStatus: delivererStatus,
      delivererStatusMessage: data['delivererStatusMessage'] as String?,
      delivererStatusUpdatedAt: (data['delivererStatusUpdatedAt'] as Timestamp?)
          ?.toDate(),
      createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
      updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
      imageCount: (data['imageCount'] as num?)?.toInt() ?? 0,
      audioCount: (data['audioCount'] as num?)?.toInt() ?? 0,
      aiSummary: data['aiSummary'] as String?,
      aiNextSteps: data['aiNextSteps'] as String?,
      aiConfidence: (data['aiConfidence'] as num?)?.toDouble(),
      aiNeedsUserAction: data['aiNeedsUserAction'] as bool?,
      transcriptionStatus: helpTicketTranscriptionStatusFromString(
        data['transcriptionStatus'] as String?,
      ),
      transcriptionError: data['transcriptionError'] as String?,
    );
  }
}
