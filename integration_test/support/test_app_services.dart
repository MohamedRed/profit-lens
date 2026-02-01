import 'package:profit_lens/app/app_scope.dart';
import 'package:profit_lens/features/auth/domain/auth_repository.dart';
import 'package:profit_lens/features/offers/data/offer_image_picker_service.dart';
import 'package:profit_lens/features/offers/data/offer_analysis_service.dart';
import 'package:profit_lens/features/offers/data/offer_repository.dart';
import 'package:profit_lens/features/profile/data/user_profile_repository.dart';
import 'package:profit_lens/features/vehicles/data/vehicle_model_lookup_service.dart';
import 'package:profit_lens/features/vehicles/data/vehicle_repository.dart';

import 'fakes/auth_repository_fake.dart';
import 'fakes/offer_image_picker_service_fake.dart';
import 'fakes/offer_repository_fake.dart';
import 'fakes/user_profile_repository_fake.dart';
import 'fakes/vehicle_model_lookup_service_fake.dart';
import 'fakes/vehicle_repository_fake.dart';

class TestAppServices extends AppServices {
  TestAppServices({
    AuthRepository? authRepository,
    UserProfileRepository? userProfileRepository,
    VehicleRepository? vehicleRepository,
    OfferRepository? offerRepository,
    OfferImagePickerService? offerImagePickerService,
    OfferAnalysisService? offerAnalysisService,
    VehicleModelLookupService? vehicleModelLookupService,
  }) : super(
          authRepository: authRepository ?? InMemoryAuthRepository(),
          userProfileRepository:
              userProfileRepository ?? InMemoryUserProfileRepository(),
          vehicleRepository:
              vehicleRepository ?? InMemoryVehicleRepository(),
          offerRepository: offerRepository ?? InMemoryOfferRepository(),
          offerImagePickerService:
              offerImagePickerService ?? const ThrowingOfferImagePickerService(),
          offerAnalysisService: offerAnalysisService,
          vehicleModelLookupService:
              vehicleModelLookupService ?? const StubVehicleModelLookupService(),
        );
}
