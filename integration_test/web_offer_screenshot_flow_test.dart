import 'package:flutter_test/flutter_test.dart';
import 'package:image_picker/image_picker.dart';
import 'package:integration_test/integration_test.dart';
import 'package:profit_lens/app/app.dart';
import 'package:profit_lens/features/offers/presentation/offer_flow_keys.dart';
import 'package:profit_lens/features/offers/presentation/sections/offer_details_summary.dart';

import 'support/fakes/auth_repository_fake.dart';
import 'support/fakes/offer_analysis_service_fake.dart';
import 'support/fakes/offer_image_picker_service_fake.dart';
import 'support/fakes/user_profile_repository_fake.dart';
import 'support/fakes/vehicle_repository_fake.dart';
import 'support/fixtures/offer_image_fixture.dart';
import 'support/fixtures/test_fixtures.dart';
import 'support/test_app_services.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('importing screenshots populates offer summary', (tester) async {
    await tester.binding.setLocale('en', 'US');
    final profile = TestFixtures.profile();
    final vehicle = TestFixtures.vehicle();
    final services = TestAppServices(
      authRepository: InMemoryAuthRepository(initialUser: TestFixtures.user),
      userProfileRepository: InMemoryUserProfileRepository(
        initialProfile: profile,
      ),
      vehicleRepository: InMemoryVehicleRepository(initialVehicles: [vehicle]),
      offerImagePickerService: AssetOfferImagePickerService(
        fixturesBySource: {
          ImageSource.gallery: OfferImageFixtures.gallery,
          ImageSource.camera: OfferImageFixtures.camera,
        },
      ),
      offerAnalysisService: FakeOfferAnalysisService(
        profile: profile,
        vehicle: vehicle,
        offersByImageName: TestFixtures.offerByFileName,
      ),
    );

    await tester.pumpWidget(ProfitLensApp(services: services));
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(OfferFlowKeys.importScreenshotButton));
    await tester.pumpAndSettle();

    expect(find.byType(OfferDetailsSummary), findsOneWidget);
    expect(find.textContaining('12.50'), findsOneWidget);
    expect(find.textContaining('6.2'), findsOneWidget);
    expect(find.text('Pickup name: Bistro Lumiere'), findsOneWidget);
    expect(
      find.text('Pickup address: 10 Rue des Fleurs, Paris'),
      findsOneWidget,
    );
    expect(find.text('Drop-off name (optional): Client A'), findsOneWidget);
    expect(
      find.text('Drop-off address: 22 Avenue Victor Hugo, Paris'),
      findsOneWidget,
    );

    await tester.tap(find.byKey(OfferFlowKeys.captureScreenshotButton));
    await tester.pumpAndSettle();

    expect(find.textContaining('12.50'), findsNothing);
    expect(find.text('Pickup name: Bistro Lumiere'), findsNothing);
    expect(find.text('Pickup address: 10 Rue des Fleurs, Paris'), findsNothing);
    expect(find.text('Drop-off name (optional): Client A'), findsNothing);
    expect(
      find.text('Drop-off address: 22 Avenue Victor Hugo, Paris'),
      findsNothing,
    );
    expect(find.textContaining('18.75'), findsOneWidget);
    expect(find.textContaining('9.8'), findsOneWidget);
    expect(find.text('Pickup name: Cafe Mono'), findsOneWidget);
    expect(find.text('Pickup address: 5 Quai Voltaire, Paris'), findsOneWidget);
    expect(find.text('Drop-off name (optional): Client B'), findsOneWidget);
    expect(
      find.text('Drop-off address: 77 Boulevard Saint-Germain, Paris'),
      findsOneWidget,
    );
  });
}
