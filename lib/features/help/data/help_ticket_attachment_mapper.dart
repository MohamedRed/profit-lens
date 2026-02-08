import 'package:cloud_firestore/cloud_firestore.dart';

import '../domain/help_ticket_attachment.dart';
import '../domain/help_ticket_attachment_type.dart';

class HelpTicketAttachmentMapper {
  HelpTicketAttachment? fromDocument(String id, Map<String, dynamic> data) {
    final url = data['url'] as String?;
    final filename = data['filename'] as String?;
    final contentType = data['contentType'] as String?;
    final sizeBytes = (data['sizeBytes'] as num?)?.toInt();
    final type = helpTicketAttachmentTypeFromString(data['type'] as String?);
    if (url == null || filename == null || contentType == null) {
      return null;
    }
    if (sizeBytes == null || type == null) {
      return null;
    }
    return HelpTicketAttachment(
      id: id,
      type: type,
      url: url,
      filename: filename,
      contentType: contentType,
      sizeBytes: sizeBytes,
      uploadedAt: (data['uploadedAt'] as Timestamp?)?.toDate(),
      durationSeconds: (data['durationSeconds'] as num?)?.toInt(),
    );
  }
}
