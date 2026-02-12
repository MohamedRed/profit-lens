import 'dart:async';

import 'package:profit_lens/features/help/data/help_ticket_repository.dart';
import 'package:profit_lens/features/help/domain/help_ticket.dart';
import 'package:profit_lens/features/help/domain/help_ticket_attachment.dart';
import 'package:profit_lens/features/help/domain/help_ticket_attachment_type.dart';
import 'package:profit_lens/features/help/domain/help_ticket_deliverer_status.dart';
import 'package:profit_lens/features/help/domain/help_ticket_draft.dart';
import 'package:profit_lens/features/help/domain/help_ticket_page.dart';
import 'package:profit_lens/features/help/domain/help_ticket_status.dart';
import 'package:profit_lens/features/help/domain/help_ticket_timeline_event.dart';
import 'package:profit_lens/features/help/domain/help_ticket_transcription_status.dart';
import 'package:uuid/uuid.dart';

class InMemoryHelpTicketRepository implements HelpTicketRepository {
  final List<HelpTicket> _tickets = [];
  final Map<String, StreamController<HelpTicket?>> _ticketControllers = {};
  final Uuid _uuid = const Uuid();

  @override
  Stream<HelpTicket?> watchTicket({
    required String uid,
    required String ticketId,
  }) async* {
    yield _tickets.cast<HelpTicket?>().firstWhere(
      (ticket) => ticket?.id == ticketId,
      orElse: () => null,
    );
    yield* _controllerForTicket(ticketId).stream;
  }

  @override
  Stream<List<HelpTicketAttachment>> watchAttachments({
    required String uid,
    required String ticketId,
  }) async* {
    yield const [];
  }

  @override
  Stream<List<HelpTicketTimelineEvent>> watchTimeline({
    required String uid,
    required String ticketId,
  }) async* {
    yield const [];
  }

  @override
  Future<HelpTicketPage> fetchTicketsPage({
    required String uid,
    HelpTicketPageCursor? cursor,
    int limit = 20,
  }) async {
    var startIndex = 0;
    if (cursor != null) {
      final cursorIndex = _tickets.indexWhere(
        (ticket) => ticket.id == cursor.id,
      );
      if (cursorIndex != -1) {
        startIndex = cursorIndex + 1;
      } else {
        startIndex = _tickets.length;
      }
    }
    final pageTickets = _tickets.skip(startIndex).take(limit).toList();
    HelpTicketPageCursor? nextCursor;
    if (pageTickets.length == limit) {
      final last = pageTickets.last;
      final updatedAt = last.updatedAt;
      if (updatedAt != null) {
        nextCursor = HelpTicketPageCursor(updatedAt: updatedAt, id: last.id);
      }
    }
    return HelpTicketPage(
      tickets: List<HelpTicket>.unmodifiable(pageTickets),
      nextCursor: nextCursor,
    );
  }

  @override
  Future<HelpTicket> createTicket({
    required String uid,
    required HelpTicketDraft draft,
    required List<HelpTicketAttachmentDraft> attachments,
  }) async {
    final now = DateTime.now();
    final imageCount = attachments
        .where((item) => item.type == HelpTicketAttachmentType.image)
        .length;
    final audioCount = attachments
        .where((item) => item.type == HelpTicketAttachmentType.audio)
        .length;
    final ticket = HelpTicket(
      id: _uuid.v4(),
      description: draft.description,
      status: HelpTicketStatus.open,
      statusMessage: null,
      delivererStatus: HelpTicketDelivererStatus.received,
      delivererStatusMessage: 'Ticket received.',
      delivererStatusUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
      imageCount: imageCount,
      audioCount: audioCount,
      aiSummary: null,
      aiNextSteps: null,
      aiConfidence: null,
      aiNeedsUserAction: null,
      transcriptionStatus:
          audioCount > 0 && draft.description.isEmpty
              ? HelpTicketTranscriptionStatus.pending
              : null,
      transcriptionError: null,
    );
    _tickets.insert(0, ticket);
    _controllerForTicket(ticket.id).add(ticket);
    return ticket;
  }

  StreamController<HelpTicket?> _controllerForTicket(String ticketId) {
    return _ticketControllers.putIfAbsent(
      ticketId,
      () => StreamController<HelpTicket?>.broadcast(),
    );
  }
}
