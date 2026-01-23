import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../auth/domain/auth_user.dart';
import 'profile_setup_screen.dart';
import '../../home/presentation/home_screen.dart';

class ProfileGate extends StatelessWidget {
  final AuthUser user;

  const ProfileGate({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);
    return StreamBuilder(
      stream: services.userProfileRepository.watchProfile(user.uid),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        final profile = snapshot.data;
        if (profile == null) {
          return ProfileSetupScreen(user: user);
        }
        return HomeScreen(user: user, profile: profile);
      },
    );
  }
}
