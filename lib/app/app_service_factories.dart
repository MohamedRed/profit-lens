import '../core/device/device_id_service.dart';
import '../features/billing/data/billing_service.dart';
import '../features/billing/data/entitlement_repository.dart';
import '../features/billing/data/usage_repository.dart';
import '../features/devices/data/device_registry_service.dart';
import '../features/devices/data/device_repository.dart';
import '../features/help/data/help_attachment_picker_service.dart';
import '../features/help/data/help_audio_transcription_service.dart';
import '../features/help/data/help_ticket_repository.dart';
import '../features/notifications/data/notification_token_repository.dart';
import '../features/offers/data/offer_analysis_service.dart';
import '../features/offers/data/offer_image_picker_service.dart';
import '../features/offers/data/offer_repository.dart';
import '../features/offers/data/offer_stats_repository.dart';
import '../features/profile/data/user_profile_repository.dart';
import '../features/vehicles/data/vehicle_model_lookup_service.dart';
import '../features/vehicles/data/vehicle_plate_lookup_service.dart';
import '../features/vehicles/data/vehicle_repository.dart';

class AppServiceFactories {
  static EntitlementRepository Function()? entitlementRepositoryFactory;
  static UsageRepository Function()? usageRepositoryFactory;
  static BillingService Function()? billingServiceFactory;
  static DeviceRegistryService Function()? deviceRegistryServiceFactory;
  static DeviceRepository Function()? deviceRepositoryFactory;
  static DeviceIdService Function()? deviceIdServiceFactory;
  static UserProfileRepository Function()? userProfileRepositoryFactory;
  static VehicleRepository Function()? vehicleRepositoryFactory;
  static OfferRepository Function()? offerRepositoryFactory;
  static OfferStatsRepository Function()? offerStatsRepositoryFactory;
  static OfferImagePickerService Function()? offerImagePickerServiceFactory;
  static OfferAnalysisService Function()? offerAnalysisServiceFactory;
  static HelpTicketRepository Function()? helpTicketRepositoryFactory;
  static HelpAudioTranscriptionService Function()?
  helpAudioTranscriptionServiceFactory;
  static HelpAttachmentPickerService Function()?
  helpAttachmentPickerServiceFactory;
  static NotificationTokenRepository Function()?
  notificationTokenRepositoryFactory;
  static VehicleModelLookupService Function()? vehicleModelLookupServiceFactory;
  static VehiclePlateLookupService Function()? vehiclePlateLookupServiceFactory;

  static EntitlementRepository createEntitlementRepository() =>
      _require(entitlementRepositoryFactory, 'EntitlementRepository');

  static UsageRepository createUsageRepository() =>
      _require(usageRepositoryFactory, 'UsageRepository');

  static BillingService createBillingService() =>
      _require(billingServiceFactory, 'BillingService');

  static DeviceRegistryService createDeviceRegistryService() =>
      _require(deviceRegistryServiceFactory, 'DeviceRegistryService');

  static DeviceRepository createDeviceRepository() =>
      _require(deviceRepositoryFactory, 'DeviceRepository');

  static DeviceIdService createDeviceIdService() =>
      _require(deviceIdServiceFactory, 'DeviceIdService');

  static UserProfileRepository createUserProfileRepository() =>
      _require(userProfileRepositoryFactory, 'UserProfileRepository');

  static VehicleRepository createVehicleRepository() =>
      _require(vehicleRepositoryFactory, 'VehicleRepository');

  static OfferRepository createOfferRepository() =>
      _require(offerRepositoryFactory, 'OfferRepository');

  static OfferStatsRepository createOfferStatsRepository() =>
      _require(offerStatsRepositoryFactory, 'OfferStatsRepository');

  static OfferImagePickerService createOfferImagePickerService() =>
      _require(offerImagePickerServiceFactory, 'OfferImagePickerService');

  static OfferAnalysisService createOfferAnalysisService() =>
      _require(offerAnalysisServiceFactory, 'OfferAnalysisService');

  static HelpTicketRepository createHelpTicketRepository() =>
      _require(helpTicketRepositoryFactory, 'HelpTicketRepository');

  static HelpAudioTranscriptionService createHelpAudioTranscriptionService() =>
      _require(
        helpAudioTranscriptionServiceFactory,
        'HelpAudioTranscriptionService',
      );

  static HelpAttachmentPickerService createHelpAttachmentPickerService() =>
      _require(
        helpAttachmentPickerServiceFactory,
        'HelpAttachmentPickerService',
      );

  static NotificationTokenRepository createNotificationTokenRepository() =>
      _require(
        notificationTokenRepositoryFactory,
        'NotificationTokenRepository',
      );

  static VehicleModelLookupService createVehicleModelLookupService() =>
      _require(vehicleModelLookupServiceFactory, 'VehicleModelLookupService');

  static VehiclePlateLookupService createVehiclePlateLookupService() =>
      _require(vehiclePlateLookupServiceFactory, 'VehiclePlateLookupService');

  static T _require<T>(T Function()? factory, String name) {
    if (factory != null) {
      return factory();
    }
    throw StateError(
      '$name factory is not configured. '
      'Call configureDeferredAppServiceFactories() before using this service.',
    );
  }
}
