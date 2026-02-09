import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:profit_lens/app/app.dart';
import 'package:profit_lens/core/utils/currency_format.dart';
import 'package:profit_lens/features/offers/presentation/offer_flow_keys.dart';
import 'package:profit_lens/features/offers/presentation/offer_flow_actions.dart';
import 'package:profit_lens/features/offers/presentation/offer_flow_coordinator_body.dart';
import 'package:profit_lens/features/offers/presentation/offer_result_screen.dart';
import 'package:profit_lens/features/offers/presentation/widgets/profitability_overview_card.dart';

import 'support/fakes/auth_repository_fake.dart';
import 'support/fakes/offer_analysis_service_fake.dart';
import 'support/fakes/user_profile_repository_fake.dart';
import 'support/fakes/vehicle_repository_fake.dart';
import 'support/fixtures/test_fixtures.dart';
import 'support/test_app_services.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('manual offer entry shows profitability details', (tester) async {
    await tester.binding.setLocale('en', 'US');
    final profile = TestFixtures.profile();
    final vehicle = TestFixtures.vehicle();
    final services = TestAppServices(
      authRepository: InMemoryAuthRepository(initialUser: TestFixtures.user),
      userProfileRepository: InMemoryUserProfileRepository(
        initialProfile: profile,
      ),
      vehicleRepository: InMemoryVehicleRepository(initialVehicles: [vehicle]),
      offerAnalysisService: FakeOfferAnalysisService(
        profile: profile,
        vehicle: vehicle,
        defaultDistanceKm: 5.4,
      ),
    );

    await tester.pumpWidget(ProfitLensApp(services: services));
    await tester.pumpAndSettle();

    expect(find.text('Or enter the offer details manually.'), findsOneWidget);
    await tester.tap(find.text('Enter manually'));
    await tester.pumpAndSettle();
    expect(find.byKey(OfferFlowKeys.payoutField), findsOneWidget);
    await tester.enterText(find.byKey(OfferFlowKeys.payoutField), '15.25');

    final coordinatorState =
        tester.state(find.byType(OfferFlowCoordinatorBody)) as dynamic;
    coordinatorState._controller.pickupAddressController.text =
        '10 Rue des Fleurs, Paris';
    coordinatorState._controller.dropoffAddressController.text =
        '22 Avenue Victor Hugo, Paris';
    coordinatorState._refresh();
    await tester.pumpAndSettle();
    await handleOfferAnalysis(
      context: tester.element(find.byType(OfferFlowCoordinatorBody)),
      formKey: coordinatorState._formKey,
      controller: coordinatorState._controller,
      profile: profile,
      user: TestFixtures.user,
      vehicles: [vehicle],
      selectedVehicleId: coordinatorState._selectedVehicleId,
      onLoadingChanged: coordinatorState._setLoading,
      onUpdated: coordinatorState._refresh,
    );
    await tester.pumpAndSettle();

    expect(find.byType(OfferResultScreen), findsOneWidget);
    await tester.pageBack();
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
    expect(find.text(CurrencyFormat.euro(payout, localeTag)), findsOneWidget);
    expect(
      find.text(CurrencyFormat.euro(totalCosts, localeTag)),
      findsOneWidget,
    );

    await tester.tap(find.byKey(OfferFlowKeys.viewDetailsButton));
    await tester.pumpAndSettle();

    expect(find.byType(OfferResultScreen), findsOneWidget);
  });
}
