import '../domain/help_ticket.dart';
import '../domain/help_ticket_attachment.dart';
import '../domain/help_ticket_draft.dart';

abstract class HelpTicketRepository {
  Stream<List<HelpTicket>> watchTickets(String uid);
  Stream<List<HelpTicketAttachment>> watchAttachments({
    required String uid,
    required String ticketId,
  });

  Future<HelpTicket> createTicket({
    required String uid,
    required HelpTicketDraft draft,
    required List<HelpTicketAttachmentDraft> attachments,
  });
}
