import 'dart:typed_data';

import 'help_ticket_attachment_type.dart';

class HelpTicketDraft {
  final String description;
  final String deviceId;
  final String platform;
  final String locale;

  const HelpTicketDraft({
    required this.description,
    required this.deviceId,
    required this.platform,
    required this.locale,
  });
}

class HelpTicketAttachmentDraft {
  final String id;
  final HelpTicketAttachmentType type;
  final String filename;
  final String contentType;
  final Uint8List bytes;
  final int sizeBytes;
  final int? durationSeconds;

  const HelpTicketAttachmentDraft({
    required this.id,
    required this.type,
    required this.filename,
    required this.contentType,
    required this.bytes,
    required this.sizeBytes,
    required this.durationSeconds,
  });
}
