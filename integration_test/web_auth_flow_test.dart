import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:profit_lens/app/app.dart';

import 'support/test_app_services.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('sign-in form validates required fields and opens register', (
    tester,
  ) async {
    await tester.binding.setLocale('en', 'US');
    await tester.pumpWidget(ProfitLensApp(services: TestAppServices()));
    await tester.pumpAndSettle();

    expect(find.widgetWithText(AppBar, 'Sign in'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('sign_in_submit')));
    await tester.pumpAndSettle();

    expect(find.text('This field is required.'), findsNWidgets(2));

    await tester.tap(find.byKey(const ValueKey('sign_in_create_account')));
    await tester.pumpAndSettle();

    expect(find.widgetWithText(AppBar, 'Create account'), findsOneWidget);
  });
}
