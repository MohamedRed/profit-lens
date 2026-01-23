import 'auth_user.dart';

abstract class AuthRepository {
  Stream<AuthUser?> authStateChanges();
  AuthUser? currentUser();
  Future<AuthUser> signInWithEmail({
    required String email,
    required String password,
  });
  Future<AuthUser> registerWithEmail({
    required String email,
    required String password,
  });
  Future<void> signOut();
}
