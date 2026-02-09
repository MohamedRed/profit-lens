import 'help_ticket.dart';

class HelpTicketPageCursor {
  final DateTime updatedAt;
  final String id;

  const HelpTicketPageCursor({
    required this.updatedAt,
    required this.id,
  });
}

class HelpTicketPage {
  final List<HelpTicket> tickets;
  final HelpTicketPageCursor? nextCursor;

  const HelpTicketPage({
    required this.tickets,
    required this.nextCursor,
  });
}
