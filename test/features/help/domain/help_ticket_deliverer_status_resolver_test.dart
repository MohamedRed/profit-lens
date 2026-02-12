import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/features/help/domain/help_ticket_deliverer_status.dart';
import 'package:profit_lens/features/help/domain/help_ticket_deliverer_status_resolver.dart';
import 'package:profit_lens/features/help/domain/help_ticket_status.dart';

void main() {
  group('resolveHelpTicketDelivererStatus', () {
    test('maps failed coding status to analyzing', () {
      final status = resolveHelpTicketDelivererStatus(
        status: HelpTicketStatus.open,
        codingAgentStatus: 'failed',
      );

      expect(status, HelpTicketDelivererStatus.analyzing);
    });

    test('maps pr_created to fixReady', () {
      final status = resolveHelpTicketDelivererStatus(
        status: HelpTicketStatus.inProgress,
        codingAgentStatus: 'pr_created',
      );

      expect(status, HelpTicketDelivererStatus.fixReady);
    });

    test('maps awaiting response to needsInfo', () {
      final status = resolveHelpTicketDelivererStatus(
        status: HelpTicketStatus.awaitingResponse,
      );

      expect(status, HelpTicketDelivererStatus.needsInfo);
    });
  });
}
