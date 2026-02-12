import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/features/help/domain/help_ticket_deliverer_status.dart';
import 'package:profit_lens/features/help/domain/help_ticket_timeline_event.dart';
import 'package:profit_lens/features/help/domain/help_ticket_timeline_source.dart';
import 'package:profit_lens/features/help/presentation/widgets/help_ticket_timeline_section.dart';
import 'package:profit_lens/l10n/app_localizations.dart';

void main() {
  testWidgets('renders empty state when no events exist', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('en'),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: const Scaffold(body: HelpTicketTimelineSection(events: [])),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('No status history yet.'), findsOneWidget);
  });

  testWidgets('renders timeline event with absolute date/time', (tester) async {
    final event = HelpTicketTimelineEvent(
      id: 'evt-1',
      status: HelpTicketDelivererStatus.analyzing,
      message: 'Analyse en cours.',
      at: DateTime(2026, 2, 12, 11, 18),
      source: HelpTicketTimelineSource.agent,
    );

    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('fr'),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: Scaffold(body: HelpTicketTimelineSection(events: [event])),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Analyse'), findsOneWidget);
    expect(find.text('Analyse en cours.'), findsOneWidget);
    expect(find.textContaining('Le'), findsWidgets);
    expect(find.textContaining('11:18'), findsOneWidget);
  });
}
