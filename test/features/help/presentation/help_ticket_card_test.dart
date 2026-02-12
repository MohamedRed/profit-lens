import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/features/help/domain/help_ticket.dart';
import 'package:profit_lens/features/help/domain/help_ticket_deliverer_status.dart';
import 'package:profit_lens/features/help/domain/help_ticket_status.dart';
import 'package:profit_lens/features/help/presentation/widgets/help_ticket_card.dart';
import 'package:profit_lens/l10n/app_localizations.dart';

void main() {
  testWidgets('renders deliverer status message instead of technical one', (
    tester,
  ) async {
    final ticket = HelpTicket(
      id: 'ticket-id',
      description: 'Tab bar moves up',
      status: HelpTicketStatus.inProgress,
      statusMessage: 'Technical running message',
      delivererStatus: HelpTicketDelivererStatus.analyzing,
      delivererStatusMessage: 'Analysis in progress.',
      delivererStatusUpdatedAt: DateTime(2026, 2, 11),
      createdAt: DateTime(2026, 2, 11),
      updatedAt: DateTime(2026, 2, 11),
      imageCount: 1,
      audioCount: 0,
      aiSummary: null,
      aiNextSteps: null,
      aiConfidence: null,
      aiNeedsUserAction: null,
      transcriptionStatus: null,
      transcriptionError: null,
    );

    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('en'),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(body: HelpTicketCard(ticket: ticket)),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Analysis in progress.'), findsOneWidget);
    expect(find.text('Technical running message'), findsNothing);
  });

  testWidgets('renders backend generated ticket title when available', (
    tester,
  ) async {
    final ticket = HelpTicket(
      id: 'ticket-id-2',
      title: 'Problème d’abonnement',
      description:
          'After I open subscription settings, checkout does not complete.',
      status: HelpTicketStatus.inProgress,
      statusMessage: null,
      delivererStatus: HelpTicketDelivererStatus.analyzing,
      delivererStatusMessage: 'Analysis in progress.',
      delivererStatusUpdatedAt: DateTime(2026, 2, 12),
      createdAt: DateTime(2026, 2, 12),
      updatedAt: DateTime(2026, 2, 12),
      imageCount: 0,
      audioCount: 0,
      aiSummary: null,
      aiNextSteps: null,
      aiConfidence: null,
      aiNeedsUserAction: null,
      transcriptionStatus: null,
      transcriptionError: null,
    );

    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('en'),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(body: HelpTicketCard(ticket: ticket)),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Problème d’abonnement'), findsOneWidget);
  });
}
