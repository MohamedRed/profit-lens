import '../domain/user_profile.dart';

abstract class UserProfileRepository {
  Stream<UserProfile?> watchProfile(String uid);
  Future<UserProfile?> fetchProfile(String uid);
  Future<void> saveProfile(UserProfile profile);
}
