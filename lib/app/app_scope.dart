import 'package:flutter/widgets.dart';

import '../features/auth/data/firebase_auth_repository.dart';
import '../features/auth/domain/auth_repository.dart';
import 'app_service_factories.dart';
import '../features/billing/data/billing_service.dart';
import '../features/billing/data/entitlement_repository.dart';
import '../features/billing/data/usage_repository.dart';
import '../features/devices/data/device_registry_service.dart';
import '../features/devices/data/device_repository.dart';
import '../features/offers/data/offer_analysis_service.dart';
import '../features/offers/data/offer_image_picker_service.dart';
import '../features/offers/data/offer_repository.dart';
import '../features/offers/data/offer_stats_repository.dart';
import '../features/profile/data/user_profile_repository.dart';
import '../features/help/data/help_attachment_picker_service.dart';
import '../features/help/data/help_audio_transcription_service.dart';
import '../features/help/data/help_ticket_repository.dart';
import '../features/notifications/data/notification_token_repository.dart';
import '../features/vehicles/data/vehicle_model_lookup_service.dart';
import '../features/vehicles/data/vehicle_plate_lookup_service.dart';
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
      _entitlementRepositoryOverride ??
      AppServiceFactories.createEntitlementRepository();

  UsageRepository get usageRepository => _usageRepository ??=
      _usageRepositoryOverride ?? AppServiceFactories.createUsageRepository();

  BillingService get billingService => _billingService ??=
      _billingServiceOverride ?? AppServiceFactories.createBillingService();

  DeviceRegistryService get deviceRegistryService => _deviceRegistryService ??=
      _deviceRegistryServiceOverride ??
      AppServiceFactories.createDeviceRegistryService();

  DeviceRepository get deviceRepository => _deviceRepository ??=
      _deviceRepositoryOverride ?? AppServiceFactories.createDeviceRepository();

  DeviceIdService get deviceIdService => _deviceIdService ??=
      _deviceIdServiceOverride ?? AppServiceFactories.createDeviceIdService();

  UserProfileRepository get userProfileRepository => _userProfileRepository ??=
      _userProfileRepositoryOverride ??
      AppServiceFactories.createUserProfileRepository();

  VehicleRepository get vehicleRepository => _vehicleRepository ??=
      _vehicleRepositoryOverride ??
      AppServiceFactories.createVehicleRepository();

  OfferRepository get offerRepository => _offerRepository ??=
      _offerRepositoryOverride ?? AppServiceFactories.createOfferRepository();

  OfferStatsRepository get offerStatsRepository => _offerStatsRepository ??=
      _offerStatsRepositoryOverride ??
      AppServiceFactories.createOfferStatsRepository();

  OfferImagePickerService get offerImagePickerService =>
      _offerImagePickerService ??=
          _offerImagePickerServiceOverride ??
          AppServiceFactories.createOfferImagePickerService();

  OfferAnalysisService get offerAnalysisService => _offerAnalysisService ??=
      _offerAnalysisServiceOverride ??
      AppServiceFactories.createOfferAnalysisService();

  HelpTicketRepository get helpTicketRepository => _helpTicketRepository ??=
      _helpTicketRepositoryOverride ??
      AppServiceFactories.createHelpTicketRepository();

  HelpAudioTranscriptionService get helpAudioTranscriptionService =>
      _helpAudioTranscriptionService ??=
          _helpAudioTranscriptionServiceOverride ??
          AppServiceFactories.createHelpAudioTranscriptionService();

  HelpAttachmentPickerService get helpAttachmentPickerService =>
      _helpAttachmentPickerService ??=
          _helpAttachmentPickerServiceOverride ??
          AppServiceFactories.createHelpAttachmentPickerService();

  NotificationTokenRepository get notificationTokenRepository =>
      _notificationTokenRepository ??=
          _notificationTokenRepositoryOverride ??
          AppServiceFactories.createNotificationTokenRepository();

  VehicleModelLookupService get vehicleModelLookupService =>
      _vehicleModelLookupService ??=
          _vehicleModelLookupServiceOverride ??
          AppServiceFactories.createVehicleModelLookupService();

  VehiclePlateLookupService get vehiclePlateLookupService =>
      _vehiclePlateLookupService ??=
          _vehiclePlateLookupServiceOverride ??
          AppServiceFactories.createVehiclePlateLookupService();

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
