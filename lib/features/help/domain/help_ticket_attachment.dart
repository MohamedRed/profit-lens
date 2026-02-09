import 'help_ticket_attachment_type.dart';

class HelpTicketAttachment {
  final String id;
  final HelpTicketAttachmentType type;
  final String url;
  final String? storagePath;
  final String filename;
  final String contentType;
  final int sizeBytes;
  final int? durationSeconds;
  final DateTime? uploadedAt;

  const HelpTicketAttachment({
    required this.id,
    required this.type,
    required this.url,
    required this.storagePath,
    required this.filename,
    required this.contentType,
    required this.sizeBytes,
    required this.durationSeconds,
    required this.uploadedAt,
  });
}
