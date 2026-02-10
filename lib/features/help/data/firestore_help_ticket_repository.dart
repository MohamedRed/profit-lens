import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../core/config/app_config.dart';
import '../domain/help_ticket.dart';
import '../domain/help_ticket_attachment.dart';
import '../domain/help_ticket_attachment_type.dart';
import '../domain/help_ticket_draft.dart';
import '../domain/help_ticket_page.dart';
import '../domain/help_ticket_status.dart';
import '../domain/help_ticket_transcription_status.dart';
import 'help_ticket_attachment_mapper.dart';
import 'help_ticket_mapper.dart';
import 'help_ticket_repository.dart';
import 'help_ticket_storage.dart';

class FirestoreHelpTicketRepository implements HelpTicketRepository {
  final FirebaseFirestore _firestore;
  final HelpTicketMapper _mapper;
  final HelpTicketAttachmentMapper _attachmentMapper;
  final HelpTicketStorage _storage;
  static const Duration _commitTimeout = Duration(seconds: 15);
  FirestoreHelpTicketRepository({
    FirebaseFirestore? firestore,
    HelpTicketMapper? mapper,
    HelpTicketAttachmentMapper? attachmentMapper,
    HelpTicketStorage? storage,
  }) : _firestore = firestore ?? FirebaseFirestore.instance,
       _mapper = mapper ?? HelpTicketMapper(),
       _attachmentMapper = attachmentMapper ?? HelpTicketAttachmentMapper(),
       _storage = storage ?? FirebaseHelpTicketStorage();

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  CollectionReference<Map<String, dynamic>> _collection(String uid) {
    return _firestore.collection('users').doc(uid).collection('helpTickets');
  }

  CollectionReference<Map<String, dynamic>> _attachmentCollection({
    required String uid,
    required String ticketId,
  }) {
    return _collection(uid).doc(ticketId).collection('attachments');
  }

  @override
  Stream<HelpTicket?> watchTicket({
    required String uid,
    required String ticketId,
  }) {
    _ensureConfigured();
    return _collection(uid).doc(ticketId).snapshots().map((snapshot) {
      if (!snapshot.exists) return null;
      final data = snapshot.data();
      if (data == null) return null;
      return _mapper.fromDocument(snapshot.id, data);
    });
  }

  @override
  Stream<List<HelpTicketAttachment>> watchAttachments({
    required String uid,
    required String ticketId,
  }) {
    _ensureConfigured();
    return _attachmentCollection(uid: uid, ticketId: ticketId)
        .orderBy('uploadedAt', descending: false)
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => _attachmentMapper.fromDocument(doc.id, doc.data()))
              .whereType<HelpTicketAttachment>()
              .toList(),
        );
  }

  @override
  Future<HelpTicketPage> fetchTicketsPage({
    required String uid,
    HelpTicketPageCursor? cursor,
    int limit = 20,
  }) async {
    _ensureConfigured();
    Query<Map<String, dynamic>> query = _collection(uid)
        .orderBy('updatedAt', descending: true)
        .orderBy(FieldPath.documentId)
        .limit(limit);
    if (cursor != null) {
      query = query.startAfter([
        Timestamp.fromDate(cursor.updatedAt),
        cursor.id,
      ]);
    }
    final snapshot = await query.get();
    final tickets = snapshot.docs
        .map((doc) => _mapper.fromDocument(doc.id, doc.data()))
        .whereType<HelpTicket>()
        .toList();
    HelpTicketPageCursor? nextCursor;
    if (snapshot.docs.length == limit) {
      final lastDoc = snapshot.docs.last;
      final updatedAt =
          (lastDoc.data()['updatedAt'] as Timestamp?)?.toDate();
      if (updatedAt != null) {
        nextCursor = HelpTicketPageCursor(
          updatedAt: updatedAt,
          id: lastDoc.id,
        );
      }
    }
    return HelpTicketPage(tickets: tickets, nextCursor: nextCursor);
  }

  @override
  Future<HelpTicket> createTicket({
    required String uid,
    required HelpTicketDraft draft,
    required List<HelpTicketAttachmentDraft> attachments,
  }) async {
    _ensureConfigured();
    final ticketRef = _collection(uid).doc();
    final ticketId = ticketRef.id;
    final uploaded = await _uploadAttachments(
      uid: uid,
      ticketId: ticketId,
      attachments: attachments,
    );

    final imageCount = uploaded
        .where((item) => item.type == HelpTicketAttachmentType.image)
        .length;
    final audioCount = uploaded
        .where((item) => item.type == HelpTicketAttachmentType.audio)
        .length;
    final needsTranscription =
        audioCount > 0 && draft.description.trim().isEmpty;

    final batch = _firestore.batch();
    batch.set(ticketRef, {
      'description': draft.description,
      'status': helpTicketStatusToString(HelpTicketStatus.open),
      'deviceId': draft.deviceId,
      'platform': draft.platform,
      'locale': draft.locale,
      'imageCount': imageCount,
      'audioCount': audioCount,
      if (needsTranscription) 'transcriptionStatus': 'pending',
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });

    final attachmentsRef = ticketRef.collection('attachments');
    for (final attachment in uploaded) {
      batch.set(attachmentsRef.doc(attachment.id), {
        'type': helpTicketAttachmentTypeToString(attachment.type),
        'url': attachment.url,
        'storagePath': attachment.storagePath,
        'filename': attachment.filename,
        'contentType': attachment.contentType,
        'sizeBytes': attachment.sizeBytes,
        if (attachment.durationSeconds != null)
          'durationSeconds': attachment.durationSeconds,
        'uploadedAt': FieldValue.serverTimestamp(),
      });
    }
    await batch.commit().timeout(_commitTimeout);

    return HelpTicket(
      id: ticketId,
      description: draft.description,
      status: HelpTicketStatus.open,
      statusMessage: null,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
      imageCount: imageCount,
      audioCount: audioCount,
      aiSummary: null,
      aiNextSteps: null,
      aiConfidence: null,
      aiNeedsUserAction: null,
      transcriptionStatus:
          needsTranscription ? HelpTicketTranscriptionStatus.pending : null,
      transcriptionError: null,
    );
  }

  Future<List<HelpTicketAttachment>> _uploadAttachments({
    required String uid,
    required String ticketId,
    required List<HelpTicketAttachmentDraft> attachments,
  }) async {
    if (attachments.isEmpty) {
      return [];
    }
    return Future.wait(
      attachments.map(
        (attachment) => _storage.uploadAttachment(
          uid: uid,
          ticketId: ticketId,
          attachment: attachment,
        ),
      ),
    );
  }
}
