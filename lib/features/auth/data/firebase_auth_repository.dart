import 'package:firebase_auth/firebase_auth.dart';

import '../../../core/config/app_config.dart';
import '../domain/auth_repository.dart';
import '../domain/auth_user.dart';

class FirebaseAuthRepository implements AuthRepository {
  final FirebaseAuth _auth;

  FirebaseAuthRepository({FirebaseAuth? auth})
    : _auth = auth ?? FirebaseAuth.instance;

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  AuthUser _mapUser(User user) => AuthUser(uid: user.uid, email: user.email);

  @override
  Stream<AuthUser?> authStateChanges() {
    _ensureConfigured();
    return _auth.authStateChanges().map((user) {
      if (user == null) return null;
      return _mapUser(user);
    });
  }

  @override
  AuthUser? currentUser() {
    _ensureConfigured();
    final user = _auth.currentUser;
    if (user == null) return null;
    return _mapUser(user);
  }

  @override
  Future<AuthUser> signInWithEmail({
    required String email,
    required String password,
  }) async {
    _ensureConfigured();
    final credential = await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
    return _mapUser(credential.user!);
  }

  @override
  Future<AuthUser> registerWithEmail({
    required String email,
    required String password,
  }) async {
    _ensureConfigured();
    final credential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    return _mapUser(credential.user!);
  }

  @override
  Future<void> signOut() async {
    _ensureConfigured();
    await _auth.signOut();
  }
}
