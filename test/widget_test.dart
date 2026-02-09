import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/app/app.dart';

import '../integration_test/support/test_app_services.dart';

void main() {
  testWidgets('App boots', (tester) async {
    await tester.pumpWidget(ProfitLensApp(services: TestAppServices()));
    await tester.pumpAndSettle();

    expect(find.textContaining('ProfitLens'), findsWidgets);
  });
}
