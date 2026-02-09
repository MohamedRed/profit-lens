import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'widgets/settings_install_card.dart';
import 'widgets/settings_language_card.dart';
import 'widgets/settings_profile_card.dart';
import 'widgets/settings_signout_card.dart';
import 'widgets/settings_vehicle_card.dart';
import 'widgets/settings_subscription_card.dart';
import 'widgets/settings_devices_card.dart';

class SettingsScreen extends StatelessWidget {
  final AuthUser user;
  final UserProfile profile;

  const SettingsScreen({super.key, required this.user, required this.profile});

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);

    return StreamBuilder<List<VehicleProfile>>(
      stream: services.vehicleRepository.watchVehicles(user.uid),
      builder: (context, snapshot) {
        final vehicles = snapshot.data ?? [];
        return Scaffold(
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              SettingsProfileCard(user: user, profile: profile),
              const SizedBox(height: 12),
              SettingsLanguageCard(user: user, profile: profile),
              const SizedBox(height: 12),
              const SettingsInstallCard(),
              const SizedBox(height: 12),
              SettingsSubscriptionCard(user: user),
              const SizedBox(height: 12),
              SettingsDevicesCard(user: user),
              const SizedBox(height: 12),
              SettingsVehicleCard(
                user: user,
                profile: profile,
                vehicles: vehicles,
              ),
              const SizedBox(height: 12),
              SettingsSignOutCard(
                onSignOut: () => services.authRepository.signOut(),
              ),
            ],
          ),
        );
      },
    );
  }
}
