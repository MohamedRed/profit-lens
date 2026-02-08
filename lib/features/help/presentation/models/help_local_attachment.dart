import 'dart:typed_data';

import '../../domain/help_ticket_attachment_type.dart';
import '../../domain/help_ticket_draft.dart';

class HelpLocalAttachment {
  final String id;
  final HelpTicketAttachmentType type;
  final String filename;
  final String contentType;
  final Uint8List bytes;
  final int sizeBytes;
  final Duration? duration;

  const HelpLocalAttachment({
    required this.id,
    required this.type,
    required this.filename,
    required this.contentType,
    required this.bytes,
    required this.sizeBytes,
    required this.duration,
  });
}

extension HelpLocalAttachmentDrafting on HelpLocalAttachment {
  HelpTicketAttachmentDraft toDraft() {
    return HelpTicketAttachmentDraft(
      id: id,
      type: type,
      filename: filename,
      contentType: contentType,
      bytes: bytes,
      sizeBytes: sizeBytes,
      durationSeconds: duration?.inSeconds,
    );
  }
}
