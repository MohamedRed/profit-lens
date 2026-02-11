import 'package:firebase_storage/firebase_storage.dart';

import '../domain/help_ticket_attachment.dart';
import '../domain/help_ticket_draft.dart';

abstract class HelpTicketStorage {
  Future<HelpTicketAttachment> uploadAttachment({
    required String uid,
    required String ticketId,
    required HelpTicketAttachmentDraft attachment,
  });
}

class FirebaseHelpTicketStorage implements HelpTicketStorage {
  final FirebaseStorage _storage;
  static const Duration _uploadTimeout = Duration(seconds: 120);
  static const Duration _downloadUrlTimeout = Duration(seconds: 30);

  FirebaseHelpTicketStorage({FirebaseStorage? storage})
    : _storage = storage ?? FirebaseStorage.instance;

  @override
  Future<HelpTicketAttachment> uploadAttachment({
    required String uid,
    required String ticketId,
    required HelpTicketAttachmentDraft attachment,
  }) async {
    final safeName = attachment.filename.replaceAll(' ', '_');
    final objectPath =
        'users/$uid/helpTickets/$ticketId/attachments/${attachment.id}-$safeName';
    final ref = _storage.ref(objectPath);
    final metadata = SettableMetadata(contentType: attachment.contentType);
    await ref.putData(attachment.bytes, metadata).timeout(_uploadTimeout);
    final url = await ref.getDownloadURL().timeout(_downloadUrlTimeout);
    return HelpTicketAttachment(
      id: attachment.id,
      type: attachment.type,
      url: url,
      storagePath: objectPath,
      filename: attachment.filename,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes,
      durationSeconds: attachment.durationSeconds,
      uploadedAt: DateTime.now(),
    );
  }
}
