import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../auth/domain/auth_user.dart';
import '../../../l10n/app_localizations.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../../../core/design_system/shadcn_tokens.dart';
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
    final l10n = AppLocalizations.of(context)!;

    return StreamBuilder<List<VehicleProfile>>(
      stream: services.vehicleRepository.watchVehicles(user.uid),
      builder: (context, snapshot) {
        final vehicles = snapshot.data ?? [];
        return Scaffold(
          appBar: AppBar(title: Text(l10n.settingsTabLabel)),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _SettingsSectionContainer(
                child: SettingsProfileCard(user: user, profile: profile),
              ),
              const SizedBox(height: 12),
              _SettingsSectionContainer(
                child: SettingsLanguageCard(user: user, profile: profile),
              ),
              const SizedBox(height: 12),
              const _SettingsSectionContainer(child: SettingsInstallCard()),
              const SizedBox(height: 12),
              _SettingsSectionContainer(
                child: SettingsSubscriptionCard(user: user),
              ),
              const SizedBox(height: 12),
              _SettingsSectionContainer(child: SettingsDevicesCard(user: user)),
              const SizedBox(height: 12),
              _SettingsSectionContainer(
                child: SettingsVehicleCard(
                  user: user,
                  profile: profile,
                  vehicles: vehicles,
                ),
              ),
              const SizedBox(height: 12),
              _SettingsSectionContainer(
                child: SettingsSignOutCard(
                  onSignOut: () => services.authRepository.signOut(),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SettingsSectionContainer extends StatelessWidget {
  final Widget child;

  const _SettingsSectionContainer({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(ShadcnRadius.xl),
        border: Border.all(color: ShadcnColors.outline),
      ),
      child: child,
    );
  }
}
