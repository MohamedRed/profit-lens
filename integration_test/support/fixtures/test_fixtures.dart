import 'package:profit_lens/features/auth/domain/auth_user.dart';
import 'package:profit_lens/features/offers/domain/offer.dart';
import 'package:profit_lens/features/profile/domain/business_activity.dart';
import 'package:profit_lens/features/profile/domain/fixed_cost_allocation.dart';
import 'package:profit_lens/features/profile/domain/user_profile.dart';
import 'package:profit_lens/features/vehicles/domain/energy_type.dart';
import 'package:profit_lens/features/vehicles/domain/vehicle_profile.dart';
import 'package:profit_lens/features/vehicles/domain/vehicle_type.dart';

class TestFixtures {
  const TestFixtures._();

  static const AuthUser user = AuthUser(
    uid: 'test-user',
    email: 'driver@example.com',
  );

  static const String galleryScreenshotFileName = 'IMG-20260122-WA0020.JPG';
  static const String cameraScreenshotFileName = 'IMG-20260122-WA0021.JPG';

  static UserProfile profile({String uid = 'test-user'}) {
    return UserProfile(
      uid: uid,
      email: user.email,
      countryCode: 'FR',
      currencyCode: 'EUR',
      activity: BusinessActivity.deliveryServices,
      socialContributionRate: 0.22,
      incomeTaxRate: 0.12,
      useLiberatoryTax: false,
      fixedCostAllocation: FixedCostAllocation.perDelivery,
      monthlyFixedCosts: 0,
      monthlyWorkingHours: 0,
      monthlyDistanceKm: 0,
      monthlyDeliveries: 0,
      minProfitabilityEuro: 0,
      defaultVehicleId: 'vehicle-1',
      useFranceDefaults: true,
      preferredLocale: 'en',
    );
  }

  static VehicleProfile vehicle({String id = 'vehicle-1'}) {
    return VehicleProfile(
      id: id,
      name: 'City Bike',
      licensePlate: null,
      brand: 'Urban',
      model: 'Flow',
      registrationYear: null,
      type: VehicleType.bike,
      energyType: EnergyType.none,
      fuelType: null,
      energyConsumptionPer100Km: 0,
      energyPricePerUnit: 0,
      maintenancePerKm: 0.05,
      depreciationPerKm: 0.02,
    );
  }

  static const Offer galleryOffer = Offer(
    payoutEuro: 12.5,
    distanceKm: 6.2,
    durationMinutes: 18,
    pickupName: 'Bistro Lumiere',
    pickupAddress: '10 Rue des Fleurs, Paris',
    dropoffName: 'Client A',
    dropoffAddress: '22 Avenue Victor Hugo, Paris',
  );

  static const Offer cameraOffer = Offer(
    payoutEuro: 18.75,
    distanceKm: 9.8,
    durationMinutes: 26,
    pickupName: 'Cafe Mono',
    pickupAddress: '5 Quai Voltaire, Paris',
    dropoffName: 'Client B',
    dropoffAddress: '77 Boulevard Saint-Germain, Paris',
  );

  static const Map<String, Offer> offerByFileName = {
    galleryScreenshotFileName: galleryOffer,
    cameraScreenshotFileName: cameraOffer,
  };
}
