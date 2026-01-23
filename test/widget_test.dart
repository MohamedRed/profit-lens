import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/app/app.dart';

void main() {
  testWidgets('App boots', (tester) async {
    await tester.pumpWidget(const ProfitLensApp());
    expect(find.text('ProfitLens'), findsOneWidget);
  });
}
