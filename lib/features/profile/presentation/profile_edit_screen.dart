import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import 'profile_edit_coordinator.dart';

class ProfileEditScreen extends StatelessWidget {
  final AuthUser user;
  final UserProfile profile;

  const ProfileEditScreen({
    super.key,
    required this.user,
    required this.profile,
  });

  @override
  Widget build(BuildContext context) {
    return ProfileEditCoordinator(user: user, profile: profile);
  }
}
