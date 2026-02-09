import 'package:flutter/material.dart';
import 'package:profit_lens/app/app_scope.dart';
import 'package:profit_lens/core/device/device_id_service.dart';
import 'package:profit_lens/core/localization/app_locale_controller.dart';
import 'package:profit_lens/features/auth/domain/auth_repository.dart';
import 'package:profit_lens/features/billing/data/billing_service.dart';
import 'package:profit_lens/features/billing/data/entitlement_repository.dart';
import 'package:profit_lens/features/billing/data/usage_repository.dart';
import 'package:profit_lens/features/devices/data/device_registry_service.dart';
import 'package:profit_lens/features/devices/data/device_repository.dart';
import 'package:profit_lens/features/help/data/help_attachment_picker_service.dart';
import 'package:profit_lens/features/help/data/help_ticket_repository.dart';
import 'package:profit_lens/features/notifications/data/notification_token_repository.dart';
import 'package:profit_lens/features/offers/data/offer_analysis_service.dart';
import 'package:profit_lens/features/offers/data/offer_image_picker_service.dart';
import 'package:profit_lens/features/offers/data/offer_repository.dart';
import 'package:profit_lens/features/offers/data/offer_stats_repository.dart';
import 'package:profit_lens/features/profile/data/user_profile_repository.dart';
import 'package:profit_lens/features/vehicles/data/vehicle_model_lookup_service.dart';
import 'package:profit_lens/features/vehicles/data/vehicle_plate_lookup_service.dart';
import 'package:profit_lens/features/vehicles/data/vehicle_repository.dart';

import 'fakes/auth_repository_fake.dart';
import 'fakes/billing_service_fake.dart';
import 'fakes/device_id_service_fake.dart';
import 'fakes/device_registry_service_fake.dart';
import 'fakes/device_repository_fake.dart';
import 'fakes/entitlement_repository_fake.dart';
import 'fakes/help_attachment_picker_service_fake.dart';
import 'fakes/help_ticket_repository_fake.dart';
import 'fakes/notification_token_repository_fake.dart';
import 'fakes/offer_image_picker_service_fake.dart';
import 'fakes/offer_repository_fake.dart';
import 'fakes/offer_stats_repository_fake.dart';
import 'fakes/usage_repository_fake.dart';
import 'fakes/user_profile_repository_fake.dart';
import 'fakes/vehicle_model_lookup_service_fake.dart';
import 'fakes/vehicle_plate_lookup_service_fake.dart';
import 'fakes/vehicle_repository_fake.dart';

class TestAppServices extends AppServices {
  TestAppServices({
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
    VehicleModelLookupService? vehicleModelLookupService,
    VehiclePlateLookupService? vehiclePlateLookupService,
    HelpTicketRepository? helpTicketRepository,
    HelpAttachmentPickerService? helpAttachmentPickerService,
    NotificationTokenRepository? notificationTokenRepository,
    AppLocaleController? localeController,
    Locale? initialLocale,
  }) : super(
         authRepository: authRepository ?? InMemoryAuthRepository(),
         entitlementRepository:
             entitlementRepository ?? InMemoryEntitlementRepository(),
         usageRepository: usageRepository ?? InMemoryUsageRepository(),
         billingService: billingService ?? const NoopBillingService(),
         deviceRegistryService:
             deviceRegistryService ?? const FakeDeviceRegistryService(),
         deviceRepository: deviceRepository ?? InMemoryDeviceRepository(),
         deviceIdService: deviceIdService ?? TestDeviceIdService(),
         userProfileRepository:
             userProfileRepository ?? InMemoryUserProfileRepository(),
         vehicleRepository: vehicleRepository ?? InMemoryVehicleRepository(),
         offerRepository: offerRepository ?? InMemoryOfferRepository(),
         offerStatsRepository:
             offerStatsRepository ?? InMemoryOfferStatsRepository(),
         offerImagePickerService:
             offerImagePickerService ?? const ThrowingOfferImagePickerService(),
         offerAnalysisService: offerAnalysisService,
         vehicleModelLookupService:
             vehicleModelLookupService ?? const StubVehicleModelLookupService(),
         vehiclePlateLookupService:
             vehiclePlateLookupService ?? const StubVehiclePlateLookupService(),
         helpTicketRepository:
             helpTicketRepository ?? InMemoryHelpTicketRepository(),
         helpAttachmentPickerService:
             helpAttachmentPickerService ??
             const ThrowingHelpAttachmentPickerService(),
         notificationTokenRepository:
             notificationTokenRepository ??
             InMemoryNotificationTokenRepository(),
         localeController:
             localeController ??
             (AppLocaleController()
               ..setLocale(initialLocale ?? const Locale('en'))),
       );
}
