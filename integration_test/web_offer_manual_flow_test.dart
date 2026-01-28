import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:profit_lens/app/app.dart';
import 'package:profit_lens/features/offers/presentation/offer_flow_keys.dart';
import 'package:profit_lens/features/offers/presentation/offer_result_screen.dart';
import 'package:profit_lens/features/offers/presentation/widgets/profitability_overview_card.dart';

import 'support/fakes/auth_repository_fake.dart';
import 'support/fakes/user_profile_repository_fake.dart';
import 'support/fakes/vehicle_repository_fake.dart';
import 'support/fixtures/test_fixtures.dart';
import 'support/test_app_services.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('manual offer entry shows profitability details', (tester) async {
    await tester.binding.setLocale('en', 'US');
    final services = TestAppServices(
      authRepository: InMemoryAuthRepository(initialUser: TestFixtures.user),
      userProfileRepository:
          InMemoryUserProfileRepository(initialProfile: TestFixtures.profile()),
      vehicleRepository:
          InMemoryVehicleRepository(initialVehicles: [TestFixtures.vehicle()]),
    );

    await tester.pumpWidget(ProfitLensApp(services: services));
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(OfferFlowKeys.payoutField),
      '15.25',
    );
    await tester.enterText(
      find.byKey(OfferFlowKeys.distanceField),
      '5.4',
    );
    await tester.pumpAndSettle();

    expect(find.byType(ProfitabilityOverviewCard), findsOneWidget);

    await tester.tap(find.byKey(OfferFlowKeys.viewDetailsButton));
    await tester.pumpAndSettle();

    expect(find.byType(OfferResultScreen), findsOneWidget);
  });
}
