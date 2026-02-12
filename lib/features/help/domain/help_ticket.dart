import 'help_ticket_status.dart';
import 'help_ticket_deliverer_status.dart';
import 'help_ticket_transcription_status.dart';

class HelpTicket {
  final String id;
  final String? title;
  final String description;
  final HelpTicketStatus status;
  final String? statusMessage;
  final HelpTicketDelivererStatus delivererStatus;
  final String? delivererStatusMessage;
  final DateTime? delivererStatusUpdatedAt;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int imageCount;
  final int audioCount;
  final String? aiSummary;
  final String? aiNextSteps;
  final double? aiConfidence;
  final bool? aiNeedsUserAction;
  final HelpTicketTranscriptionStatus? transcriptionStatus;
  final String? transcriptionError;

  const HelpTicket({
    required this.id,
    this.title,
    required this.description,
    required this.status,
    required this.statusMessage,
    required this.delivererStatus,
    required this.delivererStatusMessage,
    required this.delivererStatusUpdatedAt,
    required this.createdAt,
    required this.updatedAt,
    required this.imageCount,
    required this.audioCount,
    required this.aiSummary,
    required this.aiNextSteps,
    required this.aiConfidence,
    required this.aiNeedsUserAction,
    required this.transcriptionStatus,
    required this.transcriptionError,
  });
}
