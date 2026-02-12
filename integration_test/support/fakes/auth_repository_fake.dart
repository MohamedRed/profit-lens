import 'dart:async';

import 'package:profit_lens/features/auth/domain/auth_repository.dart';
import 'package:profit_lens/features/auth/domain/auth_user.dart';

class InMemoryAuthRepository implements AuthRepository {
  InMemoryAuthRepository({AuthUser? initialUser}) : _currentUser = initialUser;

  AuthUser? _currentUser;
  final StreamController<AuthUser?> _controller =
      StreamController<AuthUser?>.broadcast();

  @override
  bool get requiresFirebaseBootstrap => false;

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
