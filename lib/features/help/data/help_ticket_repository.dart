import '../domain/help_ticket.dart';
import '../domain/help_ticket_attachment.dart';
import '../domain/help_ticket_draft.dart';
import '../domain/help_ticket_page.dart';
import '../domain/help_ticket_timeline_event.dart';

abstract class HelpTicketRepository {
  Stream<HelpTicket?> watchTicket({
    required String uid,
    required String ticketId,
  });
  Stream<List<HelpTicketAttachment>> watchAttachments({
    required String uid,
    required String ticketId,
  });
  Stream<List<HelpTicketTimelineEvent>> watchTimeline({
    required String uid,
    required String ticketId,
  });

  Future<HelpTicketPage> fetchTicketsPage({
    required String uid,
    HelpTicketPageCursor? cursor,
    int limit = 20,
  });

  Future<HelpTicket> createTicket({
    required String uid,
    required HelpTicketDraft draft,
    required List<HelpTicketAttachmentDraft> attachments,
  });
}
