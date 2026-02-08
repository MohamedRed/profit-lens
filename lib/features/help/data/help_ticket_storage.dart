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
    await ref.putData(attachment.bytes, metadata);
    final url = await ref.getDownloadURL();
    return HelpTicketAttachment(
      id: attachment.id,
      type: attachment.type,
      url: url,
      filename: attachment.filename,
      contentType: attachment.contentType,
      sizeBytes: attachment.sizeBytes,
      uploadedAt: DateTime.now(),
      durationSeconds: attachment.durationSeconds,
    );
  }
}
