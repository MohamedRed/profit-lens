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
import '../features/help/data/firebase_help_audio_transcription_service.dart';
import '../features/help/data/help_attachment_picker_service.dart';
import '../features/help/data/help_audio_transcription_service.dart';
import '../features/help/data/help_ticket_repository.dart';
import '../features/notifications/data/firestore_notification_token_repository.dart';
import '../features/notifications/data/notification_token_repository.dart';
import '../features/vehicles/data/firebase_vehicle_model_lookup_service.dart';
import '../features/vehicles/data/firebase_vehicle_plate_lookup_service.dart';
import '../features/vehicles/data/vehicle_model_lookup_service.dart';
import '../features/vehicles/data/vehicle_plate_lookup_service.dart';
import '../features/vehicles/data/firestore_vehicle_repository.dart';
import '../features/vehicles/data/vehicle_repository.dart';
import '../core/localization/app_locale_controller.dart';
import '../core/device/device_id_service.dart';

class AppServices {
  final AuthRepository? _authRepositoryOverride;
  final EntitlementRepository? _entitlementRepositoryOverride;
  final UsageRepository? _usageRepositoryOverride;
  final BillingService? _billingServiceOverride;
  final DeviceRegistryService? _deviceRegistryServiceOverride;
  final DeviceRepository? _deviceRepositoryOverride;
  final DeviceIdService? _deviceIdServiceOverride;
  final UserProfileRepository? _userProfileRepositoryOverride;
  final VehicleRepository? _vehicleRepositoryOverride;
  final OfferRepository? _offerRepositoryOverride;
  final OfferStatsRepository? _offerStatsRepositoryOverride;
  final OfferImagePickerService? _offerImagePickerServiceOverride;
  final OfferAnalysisService? _offerAnalysisServiceOverride;
  final HelpTicketRepository? _helpTicketRepositoryOverride;
  final HelpAudioTranscriptionService? _helpAudioTranscriptionServiceOverride;
  final HelpAttachmentPickerService? _helpAttachmentPickerServiceOverride;
  final NotificationTokenRepository? _notificationTokenRepositoryOverride;
  final VehicleModelLookupService? _vehicleModelLookupServiceOverride;
  final VehiclePlateLookupService? _vehiclePlateLookupServiceOverride;
  final AppLocaleController? _localeControllerOverride;

  AuthRepository? _authRepository;
  EntitlementRepository? _entitlementRepository;
  UsageRepository? _usageRepository;
  BillingService? _billingService;
  DeviceRegistryService? _deviceRegistryService;
  DeviceRepository? _deviceRepository;
  DeviceIdService? _deviceIdService;
  UserProfileRepository? _userProfileRepository;
  VehicleRepository? _vehicleRepository;
  OfferRepository? _offerRepository;
  OfferStatsRepository? _offerStatsRepository;
  OfferImagePickerService? _offerImagePickerService;
  OfferAnalysisService? _offerAnalysisService;
  HelpTicketRepository? _helpTicketRepository;
  HelpAudioTranscriptionService? _helpAudioTranscriptionService;
  HelpAttachmentPickerService? _helpAttachmentPickerService;
  NotificationTokenRepository? _notificationTokenRepository;
  VehicleModelLookupService? _vehicleModelLookupService;
  VehiclePlateLookupService? _vehiclePlateLookupService;
  AppLocaleController? _localeController;

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
    HelpAudioTranscriptionService? helpAudioTranscriptionService,
    HelpAttachmentPickerService? helpAttachmentPickerService,
    NotificationTokenRepository? notificationTokenRepository,
    VehicleModelLookupService? vehicleModelLookupService,
    VehiclePlateLookupService? vehiclePlateLookupService,
    AppLocaleController? localeController,
  }) : _authRepositoryOverride = authRepository,
       _entitlementRepositoryOverride = entitlementRepository,
       _usageRepositoryOverride = usageRepository,
       _billingServiceOverride = billingService,
       _deviceRegistryServiceOverride = deviceRegistryService,
       _deviceRepositoryOverride = deviceRepository,
       _deviceIdServiceOverride = deviceIdService,
       _userProfileRepositoryOverride = userProfileRepository,
       _vehicleRepositoryOverride = vehicleRepository,
       _offerRepositoryOverride = offerRepository,
       _offerStatsRepositoryOverride = offerStatsRepository,
       _offerImagePickerServiceOverride = offerImagePickerService,
       _offerAnalysisServiceOverride = offerAnalysisService,
       _helpTicketRepositoryOverride = helpTicketRepository,
       _helpAudioTranscriptionServiceOverride = helpAudioTranscriptionService,
       _helpAttachmentPickerServiceOverride = helpAttachmentPickerService,
       _notificationTokenRepositoryOverride = notificationTokenRepository,
       _vehicleModelLookupServiceOverride = vehicleModelLookupService,
       _vehiclePlateLookupServiceOverride = vehiclePlateLookupService,
       _localeControllerOverride = localeController;

  AuthRepository get authRepository =>
      _authRepository ??= _authRepositoryOverride ?? FirebaseAuthRepository();

  EntitlementRepository get entitlementRepository => _entitlementRepository ??=
      _entitlementRepositoryOverride ?? FirestoreEntitlementRepository();

  UsageRepository get usageRepository => _usageRepository ??=
      _usageRepositoryOverride ?? FirestoreUsageRepository();

  BillingService get billingService =>
      _billingService ??= _billingServiceOverride ?? FirebaseBillingService();

  DeviceRegistryService get deviceRegistryService => _deviceRegistryService ??=
      _deviceRegistryServiceOverride ?? FirebaseDeviceRegistryService();

  DeviceRepository get deviceRepository => _deviceRepository ??=
      _deviceRepositoryOverride ?? FirestoreDeviceRepository();

  DeviceIdService get deviceIdService =>
      _deviceIdService ??= _deviceIdServiceOverride ?? DeviceIdService();

  UserProfileRepository get userProfileRepository => _userProfileRepository ??=
      _userProfileRepositoryOverride ?? FirestoreUserProfileRepository();

  VehicleRepository get vehicleRepository => _vehicleRepository ??=
      _vehicleRepositoryOverride ?? FirestoreVehicleRepository();

  OfferRepository get offerRepository => _offerRepository ??=
      _offerRepositoryOverride ?? FirestoreOfferRepository();

  OfferStatsRepository get offerStatsRepository => _offerStatsRepository ??=
      _offerStatsRepositoryOverride ?? FirestoreOfferStatsRepository();

  OfferImagePickerService get offerImagePickerService =>
      _offerImagePickerService ??=
          _offerImagePickerServiceOverride ?? DeviceOfferImagePickerService();

  OfferAnalysisService get offerAnalysisService => _offerAnalysisService ??=
      _offerAnalysisServiceOverride ?? FirebaseOfferAnalysisService();

  HelpTicketRepository get helpTicketRepository => _helpTicketRepository ??=
      _helpTicketRepositoryOverride ?? FirestoreHelpTicketRepository();

  HelpAudioTranscriptionService get helpAudioTranscriptionService =>
      _helpAudioTranscriptionService ??=
          _helpAudioTranscriptionServiceOverride ??
          FirebaseHelpAudioTranscriptionService();

  HelpAttachmentPickerService get helpAttachmentPickerService =>
      _helpAttachmentPickerService ??=
          _helpAttachmentPickerServiceOverride ??
          DeviceHelpAttachmentPickerService();

  NotificationTokenRepository get notificationTokenRepository =>
      _notificationTokenRepository ??=
          _notificationTokenRepositoryOverride ??
          FirestoreNotificationTokenRepository();

  VehicleModelLookupService get vehicleModelLookupService =>
      _vehicleModelLookupService ??=
          _vehicleModelLookupServiceOverride ??
          FirebaseVehicleModelLookupService();

  VehiclePlateLookupService get vehiclePlateLookupService =>
      _vehiclePlateLookupService ??=
          _vehiclePlateLookupServiceOverride ??
          FirebaseVehiclePlateLookupService();

  AppLocaleController get localeController =>
      _localeController ??= _localeControllerOverride ?? AppLocaleController();
}

class AppScope extends InheritedWidget {
  final AppServices services;

  const AppScope({super.key, required this.services, required super.child});

  static AppServices of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    if (scope == null) {
      throw StateError('AppScope not found in widget tree.');
    }
    return scope.services;
  }

  @override
  bool updateShouldNotify(AppScope oldWidget) => services != oldWidget.services;
}
