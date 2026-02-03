import 'package:flutter/widgets.dart';

import '../features/auth/data/firebase_auth_repository.dart';
import '../features/auth/domain/auth_repository.dart';
import '../features/offers/data/firestore_offer_repository.dart';
import '../features/offers/data/offer_analysis_service.dart';
import '../features/offers/data/firebase_offer_analysis_service.dart';
import '../features/offers/data/offer_image_picker_service.dart';
import '../features/offers/data/offer_repository.dart';
import '../features/profile/data/firestore_user_profile_repository.dart';
import '../features/profile/data/user_profile_repository.dart';
import '../features/vehicles/data/firebase_vehicle_model_lookup_service.dart';
import '../features/vehicles/data/firebase_vehicle_plate_lookup_service.dart';
import '../features/vehicles/data/vehicle_model_lookup_service.dart';
import '../features/vehicles/data/vehicle_plate_lookup_service.dart';
import '../features/vehicles/data/firestore_vehicle_repository.dart';
import '../features/vehicles/data/vehicle_repository.dart';
import '../core/localization/app_locale_controller.dart';

class AppServices {
  final AuthRepository authRepository;
  final UserProfileRepository userProfileRepository;
  final VehicleRepository vehicleRepository;
  final OfferRepository offerRepository;
  final OfferImagePickerService offerImagePickerService;
  final OfferAnalysisService offerAnalysisService;
  final VehicleModelLookupService vehicleModelLookupService;
  final VehiclePlateLookupService vehiclePlateLookupService;
  final AppLocaleController localeController;

  AppServices({
    AuthRepository? authRepository,
    UserProfileRepository? userProfileRepository,
    VehicleRepository? vehicleRepository,
    OfferRepository? offerRepository,
    OfferImagePickerService? offerImagePickerService,
    OfferAnalysisService? offerAnalysisService,
    VehicleModelLookupService? vehicleModelLookupService,
    VehiclePlateLookupService? vehiclePlateLookupService,
    AppLocaleController? localeController,
  })  : authRepository = authRepository ?? FirebaseAuthRepository(),
        userProfileRepository =
            userProfileRepository ?? FirestoreUserProfileRepository(),
        vehicleRepository = vehicleRepository ?? FirestoreVehicleRepository(),
        offerRepository = offerRepository ?? FirestoreOfferRepository(),
        offerImagePickerService =
            offerImagePickerService ?? DeviceOfferImagePickerService(),
        offerAnalysisService =
            offerAnalysisService ?? FirebaseOfferAnalysisService(),
        vehicleModelLookupService = vehicleModelLookupService ??
            FirebaseVehicleModelLookupService(),
        vehiclePlateLookupService = vehiclePlateLookupService ??
            FirebaseVehiclePlateLookupService(),
        localeController = localeController ?? AppLocaleController();
}

class AppScope extends InheritedWidget {
  final AppServices services;

  const AppScope({
    super.key,
    required this.services,
    required super.child,
  });

  static AppServices of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    if (scope == null) {
      throw StateError('AppScope not found in widget tree.');
    }
    return scope.services;
  }

  @override
  bool updateShouldNotify(AppScope oldWidget) =>
      services != oldWidget.services;
}
