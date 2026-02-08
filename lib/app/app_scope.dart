import 'package:flutter/widgets.dart';

import '../features/auth/data/firebase_auth_repository.dart';
import '../features/auth/domain/auth_repository.dart';
import '../features/billing/data/billing_service.dart';
import '../features/billing/data/entitlement_repository.dart';
import '../features/billing/data/firestore_entitlement_repository.dart';
import '../features/billing/data/firestore_usage_repository.dart';
import '../features/billing/data/firebase_billing_service.dart';
import '../features/billing/data/usage_repository.dart';
import '../features/devices/data/device_registry_service.dart';
import '../features/devices/data/device_repository.dart';
import '../features/devices/data/firebase_device_registry_service.dart';
import '../features/devices/data/firestore_device_repository.dart';
import '../features/offers/data/firestore_offer_repository.dart';
import '../features/offers/data/firestore_offer_stats_repository.dart';
import '../features/offers/data/offer_analysis_service.dart';
import '../features/offers/data/firebase_offer_analysis_service.dart';
import '../features/offers/data/offer_image_picker_service.dart';
import '../features/offers/data/offer_repository.dart';
import '../features/offers/data/offer_stats_repository.dart';
import '../features/profile/data/firestore_user_profile_repository.dart';
import '../features/profile/data/user_profile_repository.dart';
import '../features/help/data/firestore_help_ticket_repository.dart';
import '../features/help/data/help_attachment_picker_service.dart';
import '../features/help/data/help_ticket_repository.dart';
import '../features/vehicles/data/firebase_vehicle_model_lookup_service.dart';
import '../features/vehicles/data/firebase_vehicle_plate_lookup_service.dart';
import '../features/vehicles/data/vehicle_model_lookup_service.dart';
import '../features/vehicles/data/vehicle_plate_lookup_service.dart';
import '../features/vehicles/data/firestore_vehicle_repository.dart';
import '../features/vehicles/data/vehicle_repository.dart';
import '../core/localization/app_locale_controller.dart';
import '../core/device/device_id_service.dart';

class AppServices {
  final AuthRepository authRepository;
  final EntitlementRepository entitlementRepository;
  final UsageRepository usageRepository;
  final BillingService billingService;
  final DeviceRegistryService deviceRegistryService;
  final DeviceRepository deviceRepository;
  final DeviceIdService deviceIdService;
  final UserProfileRepository userProfileRepository;
  final VehicleRepository vehicleRepository;
  final OfferRepository offerRepository;
  final OfferStatsRepository offerStatsRepository;
  final OfferImagePickerService offerImagePickerService;
  final OfferAnalysisService offerAnalysisService;
  final HelpTicketRepository helpTicketRepository;
  final HelpAttachmentPickerService helpAttachmentPickerService;
  final VehicleModelLookupService vehicleModelLookupService;
  final VehiclePlateLookupService vehiclePlateLookupService;
  final AppLocaleController localeController;

  AppServices({
    AuthRepository? authRepository,
    EntitlementRepository? entitlementRepository,
    UsageRepository? usageRepository,
    BillingService? billingService,
    DeviceRegistryService? deviceRegistryService,
    DeviceRepository? deviceRepository,
    DeviceIdService? deviceIdService,
    UserProfileRepository? userProfileRepository,
    VehicleRepository? vehicleRepository,
    OfferRepository? offerRepository,
    OfferStatsRepository? offerStatsRepository,
    OfferImagePickerService? offerImagePickerService,
    OfferAnalysisService? offerAnalysisService,
    HelpTicketRepository? helpTicketRepository,
    HelpAttachmentPickerService? helpAttachmentPickerService,
    VehicleModelLookupService? vehicleModelLookupService,
    VehiclePlateLookupService? vehiclePlateLookupService,
    AppLocaleController? localeController,
  })  : authRepository = authRepository ?? FirebaseAuthRepository(),
        entitlementRepository =
            entitlementRepository ?? FirestoreEntitlementRepository(),
        usageRepository = usageRepository ?? FirestoreUsageRepository(),
        billingService = billingService ?? FirebaseBillingService(),
        deviceRegistryService =
            deviceRegistryService ?? FirebaseDeviceRegistryService(),
        deviceRepository = deviceRepository ?? FirestoreDeviceRepository(),
        deviceIdService = deviceIdService ?? DeviceIdService(),
        userProfileRepository =
            userProfileRepository ?? FirestoreUserProfileRepository(),
        vehicleRepository = vehicleRepository ?? FirestoreVehicleRepository(),
        offerRepository = offerRepository ?? FirestoreOfferRepository(),
        offerStatsRepository =
            offerStatsRepository ?? FirestoreOfferStatsRepository(),
        offerImagePickerService =
            offerImagePickerService ?? DeviceOfferImagePickerService(),
        offerAnalysisService =
            offerAnalysisService ?? FirebaseOfferAnalysisService(),
        helpTicketRepository =
            helpTicketRepository ?? FirestoreHelpTicketRepository(),
        helpAttachmentPickerService =
            helpAttachmentPickerService ?? DeviceHelpAttachmentPickerService(),
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
