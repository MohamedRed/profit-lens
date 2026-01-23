import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import 'profile_setup_coordinator.dart';

class ProfileSetupScreen extends StatelessWidget {
  final AuthUser user;

  const ProfileSetupScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return ProfileSetupCoordinator(user: user);
  }
}
