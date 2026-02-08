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
  });
}
