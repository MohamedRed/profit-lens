import 'help_ticket_attachment_type.dart';

class HelpTicketAttachment {
  final String id;
  final HelpTicketAttachmentType type;
  final String url;
  final String filename;
  final String contentType;
  final int sizeBytes;
  final DateTime? uploadedAt;
  final int? durationSeconds;

  const HelpTicketAttachment({
    required this.id,
    required this.type,
    required this.url,
    required this.filename,
    required this.contentType,
    required this.sizeBytes,
    required this.uploadedAt,
    required this.durationSeconds,
  });
}
