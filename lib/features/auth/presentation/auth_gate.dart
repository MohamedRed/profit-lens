import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../domain/auth_user.dart';
import 'sign_in_screen.dart';
import '../../profile/presentation/profile_gate.dart';

class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);
    return StreamBuilder<AuthUser?>(
      stream: services.authRepository.authStateChanges(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        final user = snapshot.data;
        if (user == null) {
          return const SignInScreen();
        }
        return ProfileGate(user: user);
      },
    );
  }
}
