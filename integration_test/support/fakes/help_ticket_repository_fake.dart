import 'dart:async';

import 'package:profit_lens/features/help/data/help_ticket_repository.dart';
import 'package:profit_lens/features/help/domain/help_ticket.dart';
import 'package:profit_lens/features/help/domain/help_ticket_attachment.dart';
import 'package:profit_lens/features/help/domain/help_ticket_attachment_type.dart';
import 'package:profit_lens/features/help/domain/help_ticket_draft.dart';
import 'package:profit_lens/features/help/domain/help_ticket_status.dart';
import 'package:uuid/uuid.dart';

class InMemoryHelpTicketRepository implements HelpTicketRepository {
  final List<HelpTicket> _tickets = [];
  final StreamController<List<HelpTicket>> _controller =
      StreamController<List<HelpTicket>>.broadcast();
  final Map<String, StreamController<HelpTicket?>> _ticketControllers = {};
  final Uuid _uuid = const Uuid();

  @override
  Stream<List<HelpTicket>> watchTickets(String uid) async* {
    yield List<HelpTicket>.unmodifiable(_tickets);
    yield* _controller.stream;
  }

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
      title: draft.title,
      description: draft.description,
      status: HelpTicketStatus.open,
      statusMessage: null,
      createdAt: now,
      updatedAt: now,
      imageCount: imageCount,
      audioCount: audioCount,
      aiSummary: null,
      aiNextSteps: null,
      aiConfidence: null,
      aiNeedsUserAction: null,
    );
    _tickets.insert(0, ticket);
    _controller.add(List<HelpTicket>.unmodifiable(_tickets));
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
