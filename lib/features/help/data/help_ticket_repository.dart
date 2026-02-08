import '../domain/help_ticket.dart';
import '../domain/help_ticket_draft.dart';

abstract class HelpTicketRepository {
  Stream<List<HelpTicket>> watchTickets(String uid);

  Future<HelpTicket> createTicket({
    required String uid,
    required HelpTicketDraft draft,
    required List<HelpTicketAttachmentDraft> attachments,
  });
}
