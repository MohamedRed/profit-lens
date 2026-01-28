import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:profit_lens/app/app.dart';
import 'package:profit_lens/core/utils/currency_format.dart';
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

    const localeTag = 'en_US';
    const payout = 15.25;
    const distance = 5.4;
    final maintenanceCost = distance * 0.05;
    final depreciationCost = distance * 0.02;
    final socialContributions = payout * 0.22;
    final incomeTax = payout * 0.12;
    final totalCosts =
        maintenanceCost + depreciationCost + socialContributions + incomeTax;
    final netProfit = payout - totalCosts;

    expect(
      find.text(CurrencyFormat.euro(netProfit, localeTag)),
      findsOneWidget,
    );
    expect(find.text('Profitability overview'), findsOneWidget);
    expect(find.text('Gross revenue'), findsOneWidget);
    expect(find.text('Total costs'), findsOneWidget);
    expect(find.text('Net profit'), findsOneWidget);
    expect(
      find.text(CurrencyFormat.euro(payout, localeTag)),
      findsOneWidget,
    );
    expect(
      find.text(CurrencyFormat.euro(totalCosts, localeTag)),
      findsOneWidget,
    );

    await tester.tap(find.byKey(OfferFlowKeys.viewDetailsButton));
    await tester.pumpAndSettle();

    expect(find.byType(OfferResultScreen), findsOneWidget);
  });
}
