import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../domain/vehicle_profile.dart';
import 'vehicle_form_coordinator.dart';

class VehicleFormScreen extends StatelessWidget {
  final AuthUser user;
  final UserProfile profile;
  final VehicleProfile? vehicle;

  const VehicleFormScreen({
    super.key,
    required this.user,
    required this.profile,
    this.vehicle,
  });

  @override
  Widget build(BuildContext context) {
    return VehicleFormCoordinator(
      user: user,
      profile: profile,
      vehicle: vehicle,
    );
  }
}
