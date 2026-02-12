import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/features/help/data/help_ticket_mapper.dart';
import 'package:profit_lens/features/help/domain/help_ticket_deliverer_status.dart';
import 'package:profit_lens/features/help/domain/help_ticket_status.dart';

void main() {
  group('HelpTicketMapper', () {
    test('reads persisted deliverer status fields', () {
      final mapper = HelpTicketMapper();
      final ticket = mapper.fromDocument('ticket-1', {
        'title': 'Subscription issue',
        'description': 'Issue detail',
        'status': 'in_progress',
        'delivererStatus': 'fix_ready',
        'delivererStatusMessage': 'A fix is ready and under validation.',
        'delivererStatusUpdatedAt': Timestamp.fromDate(DateTime(2026, 2, 11)),
      });

      expect(ticket, isNotNull);
      expect(ticket!.title, 'Subscription issue');
      expect(ticket.status, HelpTicketStatus.inProgress);
      expect(ticket.delivererStatus, HelpTicketDelivererStatus.fixReady);
      expect(
        ticket.delivererStatusMessage,
        'A fix is ready and under validation.',
      );
      expect(ticket.delivererStatusUpdatedAt, DateTime(2026, 2, 11));
    });

    test('falls back to resolver when deliverer fields are missing', () {
      final mapper = HelpTicketMapper();
      final ticket = mapper.fromDocument('ticket-2', {
        'description': 'Issue detail',
        'status': 'open',
        'codingAgentStatus': 'failed',
      });

      expect(ticket, isNotNull);
      expect(ticket!.delivererStatus, HelpTicketDelivererStatus.analyzing);
      expect(ticket.delivererStatusMessage, isNull);
    });
  });
}
