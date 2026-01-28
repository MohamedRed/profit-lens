import 'dart:async';

import 'package:image_picker/image_picker.dart';
import 'package:profit_lens/app/app_scope.dart';
import 'package:profit_lens/features/auth/domain/auth_repository.dart';
import 'package:profit_lens/features/auth/domain/auth_user.dart';
import 'package:profit_lens/features/offers/data/offer_ingestion_service.dart';
import 'package:profit_lens/features/offers/data/offer_repository.dart';
import 'package:profit_lens/features/offers/domain/offer_extraction_result.dart';
import 'package:profit_lens/features/offers/domain/offer_record.dart';
import 'package:profit_lens/features/profile/data/user_profile_repository.dart';
import 'package:profit_lens/features/profile/domain/user_profile.dart';
import 'package:profit_lens/features/vehicles/data/vehicle_model_lookup_service.dart';
import 'package:profit_lens/features/vehicles/data/vehicle_repository.dart';
import 'package:profit_lens/features/vehicles/domain/energy_type.dart';
import 'package:profit_lens/features/vehicles/domain/vehicle_profile.dart';

class TestAppServices extends AppServices {
  TestAppServices()
      : super(
          authRepository: FakeAuthRepository(),
          userProfileRepository: FakeUserProfileRepository(),
          vehicleRepository: FakeVehicleRepository(),
          offerRepository: FakeOfferRepository(),
          offerIngestionService: FakeOfferIngestionService(),
          vehicleModelLookupService: FakeVehicleModelLookupService(),
        );
}

class FakeAuthRepository implements AuthRepository {
  AuthUser? _currentUser;
  final StreamController<AuthUser?> _controller =
      StreamController<AuthUser?>.broadcast();

  @override
  Stream<AuthUser?> authStateChanges() async* {
    yield _currentUser;
    yield* _controller.stream;
  }

  @override
  AuthUser? currentUser() => _currentUser;

  @override
  Future<AuthUser> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final user = AuthUser(uid: 'test-user', email: email);
    _currentUser = user;
    _controller.add(user);
    return user;
  }

  @override
  Future<AuthUser> registerWithEmail({
    required String email,
    required String password,
  }) async {
    return signInWithEmail(email: email, password: password);
  }

  @override
  Future<void> signOut() async {
    _currentUser = null;
    _controller.add(null);
  }
}

class FakeUserProfileRepository implements UserProfileRepository {
  @override
  Stream<UserProfile?> watchProfile(String uid) => Stream.value(null);

  @override
  Future<UserProfile?> fetchProfile(String uid) async => null;

  @override
  Future<void> saveProfile(UserProfile profile) async {}
}

class FakeVehicleRepository implements VehicleRepository {
  @override
  Stream<List<VehicleProfile>> watchVehicles(String uid) =>
      Stream.value(const []);

  @override
  Future<List<VehicleProfile>> fetchVehicles(String uid) async => const [];

  @override
  Future<void> saveVehicle(String uid, VehicleProfile vehicle) async {}

  @override
  Future<void> deleteVehicle(String uid, String vehicleId) async {}
}

class FakeOfferRepository implements OfferRepository {
  @override
  Future<void> saveOffer(String uid, OfferRecord offer) async {}

  @override
  Stream<List<OfferRecord>> watchOffers(String uid) => Stream.value(const []);

  @override
  Future<List<OfferRecord>> fetchOffers(String uid) async => const [];
}

class FakeOfferIngestionService implements OfferIngestionService {
  @override
  Future<OfferExtractionResult> extractFromImage(XFile image) async {
    return const OfferExtractionResult(
      offer: null,
      confidence: 0,
      rawText: null,
    );
  }
}

class FakeVehicleModelLookupService implements VehicleModelLookupService {
  @override
  Future<VehicleModelLookupResult?> lookup({
    required String brand,
    required String model,
    required EnergyType energyType,
  }) async {
    return null;
  }
}
