import '../core/device/device_id_service.dart';
import '../features/billing/data/firebase_billing_service.dart';
import '../features/billing/data/firestore_entitlement_repository.dart';
import '../features/billing/data/firestore_usage_repository.dart';
import '../features/devices/data/firebase_device_registry_service.dart';
import '../features/devices/data/firestore_device_repository.dart';
import '../features/help/data/firebase_help_audio_transcription_service.dart';
import '../features/help/data/firestore_help_ticket_repository.dart';
import '../features/help/data/help_attachment_picker_service.dart';
import '../features/notifications/data/firestore_notification_token_repository.dart';
import '../features/offers/data/firebase_offer_analysis_service.dart';
import '../features/offers/data/firestore_offer_repository.dart';
import '../features/offers/data/firestore_offer_stats_repository.dart';
import '../features/offers/data/offer_image_picker_service.dart';
import '../features/profile/data/firestore_user_profile_repository.dart';
import '../features/vehicles/data/firebase_vehicle_model_lookup_service.dart';
import '../features/vehicles/data/firebase_vehicle_plate_lookup_service.dart';
import '../features/vehicles/data/firestore_vehicle_repository.dart';
import 'app_service_factories.dart';

bool _configured = false;

void configureDeferredAppServiceFactories() {
  if (_configured) {
    return;
  }
  _configured = true;

  AppServiceFactories.entitlementRepositoryFactory =
      FirestoreEntitlementRepository.new;
  AppServiceFactories.usageRepositoryFactory = FirestoreUsageRepository.new;
  AppServiceFactories.billingServiceFactory = FirebaseBillingService.new;
  AppServiceFactories.deviceRegistryServiceFactory =
      FirebaseDeviceRegistryService.new;
  AppServiceFactories.deviceRepositoryFactory = FirestoreDeviceRepository.new;
  AppServiceFactories.deviceIdServiceFactory = DeviceIdService.new;
  AppServiceFactories.userProfileRepositoryFactory =
      FirestoreUserProfileRepository.new;
  AppServiceFactories.vehicleRepositoryFactory = FirestoreVehicleRepository.new;
  AppServiceFactories.offerRepositoryFactory = FirestoreOfferRepository.new;
  AppServiceFactories.offerStatsRepositoryFactory =
      FirestoreOfferStatsRepository.new;
  AppServiceFactories.offerImagePickerServiceFactory =
      DeviceOfferImagePickerService.new;
  AppServiceFactories.offerAnalysisServiceFactory =
      FirebaseOfferAnalysisService.new;
  AppServiceFactories.helpTicketRepositoryFactory =
      FirestoreHelpTicketRepository.new;
  AppServiceFactories.helpAudioTranscriptionServiceFactory =
      FirebaseHelpAudioTranscriptionService.new;
  AppServiceFactories.helpAttachmentPickerServiceFactory =
      DeviceHelpAttachmentPickerService.new;
  AppServiceFactories.notificationTokenRepositoryFactory =
      FirestoreNotificationTokenRepository.new;
  AppServiceFactories.vehicleModelLookupServiceFactory =
      FirebaseVehicleModelLookupService.new;
  AppServiceFactories.vehiclePlateLookupServiceFactory =
      FirebaseVehiclePlateLookupService.new;
}
