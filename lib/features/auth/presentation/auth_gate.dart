import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../domain/auth_user.dart';
import 'sign_in_screen.dart';
import '../../profile/presentation/profile_gate.dart';

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  static const _authStartupDelay = Duration(milliseconds: 700);

  Stream<AuthUser?>? _authStream;
  AuthUser? _initialUser;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) {
      return;
    }
    _initialized = true;
    final services = AppScope.of(context);
    _initialUser = services.authRepository.currentUser();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future<void>.delayed(_authStartupDelay, () {
        if (!mounted) {
          return;
        }
        setState(() {
          _authStream = services.authRepository.authStateChanges();
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_authStream == null) {
      final initialUser = _initialUser;
      if (initialUser == null) {
        return const SignInScreen();
      }
      return ProfileGate(user: initialUser);
    }

    return StreamBuilder<AuthUser?>(
      stream: _authStream,
      initialData: _initialUser,
      builder: (context, snapshot) {
        final user = snapshot.data;
        if (user == null) {
          return const SignInScreen();
        }
        return ProfileGate(user: user);
      },
    );
  }
}
