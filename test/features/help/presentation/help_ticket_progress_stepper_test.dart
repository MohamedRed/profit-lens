import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/features/help/domain/help_ticket_deliverer_status.dart';
import 'package:profit_lens/features/help/presentation/widgets/help_ticket_progress_stepper.dart';
import 'package:profit_lens/l10n/app_localizations.dart';

void main() {
  testWidgets('renders expected done/current/upcoming progression', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        locale: const Locale('fr'),
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
        home: const Scaffold(
          body: HelpTicketProgressStepper(
            currentStatus: HelpTicketDelivererStatus.fixReady,
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Reçu'), findsOneWidget);
    expect(find.text('Analyse'), findsOneWidget);
    expect(find.text('Info requise'), findsOneWidget);
    expect(find.text('Correctif prêt'), findsOneWidget);
    expect(find.text('Résolu'), findsOneWidget);

    expect(find.byIcon(Icons.check), findsNWidgets(3));
  });
}
