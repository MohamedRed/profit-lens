import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/features/help/data/help_ticket_timeline_mapper.dart';
import 'package:profit_lens/features/help/domain/help_ticket_deliverer_status.dart';
import 'package:profit_lens/features/help/domain/help_ticket_timeline_source.dart';

void main() {
  group('HelpTicketTimelineMapper', () {
    test('maps valid document', () {
      final mapper = HelpTicketTimelineMapper();
      final event = mapper.fromDocument('evt-1', {
        'status': 'analyzing',
        'message': 'Analyse en cours.',
        'at': Timestamp.fromDate(DateTime(2026, 2, 12, 11, 0)),
        'source': 'triage',
      });

      expect(event, isNotNull);
      expect(event!.id, 'evt-1');
      expect(event.status, HelpTicketDelivererStatus.analyzing);
      expect(event.source, HelpTicketTimelineSource.triage);
    });

    test('returns null on invalid payload', () {
      final mapper = HelpTicketTimelineMapper();
      final event = mapper.fromDocument('evt-2', {
        'status': 'invalid_status',
        'message': 'x',
      });
      expect(event, isNull);
    });
  });
}
