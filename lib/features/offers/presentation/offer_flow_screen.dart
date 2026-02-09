import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import 'offer_flow_coordinator.dart';

class OfferFlowScreen extends StatelessWidget {
  final AuthUser user;
  final UserProfile profile;

  const OfferFlowScreen({super.key, required this.user, required this.profile});

  @override
  Widget build(BuildContext context) {
    return OfferFlowCoordinator(user: user, profile: profile);
  }
}
