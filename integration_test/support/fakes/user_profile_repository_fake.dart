import 'dart:async';

import 'package:profit_lens/features/profile/data/user_profile_repository.dart';
import 'package:profit_lens/features/profile/domain/user_profile.dart';

class InMemoryUserProfileRepository implements UserProfileRepository {
  InMemoryUserProfileRepository({UserProfile? initialProfile})
      : _profile = initialProfile;

  UserProfile? _profile;
  final StreamController<UserProfile?> _controller =
      StreamController<UserProfile?>.broadcast();

  @override
  Stream<UserProfile?> watchProfile(String uid) async* {
    yield _profile;
    yield* _controller.stream;
  }

  @override
  Future<UserProfile?> fetchProfile(String uid) async => _profile;

  @override
  Future<void> saveProfile(UserProfile profile) async {
    _profile = profile;
    _controller.add(profile);
  }
}
