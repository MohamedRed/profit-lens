import 'help_ticket_status.dart';

class HelpTicket {
  final String id;
  final String title;
  final String description;
  final HelpTicketStatus status;
  final String? statusMessage;
  final DateTime? createdAt;
  final DateTime? updatedAt;
  final int imageCount;
  final int audioCount;
  final String? aiSummary;
  final String? aiNextSteps;
  final double? aiConfidence;
  final bool? aiNeedsUserAction;

  const HelpTicket({
    required this.id,
    required this.title,
    required this.description,
    required this.status,
    required this.statusMessage,
    required this.createdAt,
    required this.updatedAt,
    required this.imageCount,
    required this.audioCount,
    required this.aiSummary,
    required this.aiNextSteps,
    required this.aiConfidence,
    required this.aiNeedsUserAction,
  });
}
