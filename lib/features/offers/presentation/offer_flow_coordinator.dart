import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import 'offer_flow_coordinator_body.dart';

class OfferFlowCoordinator extends StatelessWidget {
  final AuthUser user;
  final UserProfile profile;

  const OfferFlowCoordinator({
    super.key,
    required this.user,
    required this.profile,
  });

  @override
  Widget build(BuildContext context) {
    return OfferFlowCoordinatorBody(user: user, profile: profile);
  }
}
