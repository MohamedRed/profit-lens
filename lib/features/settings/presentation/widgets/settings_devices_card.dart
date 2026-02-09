import 'package:flutter/material.dart';

import '../../../../core/config/app_config.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/domain/auth_user.dart';
import '../../../devices/presentation/device_management_screen.dart';

class SettingsDevicesCard extends StatelessWidget {
  final AuthUser user;

  const SettingsDevicesCard({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    if (!AppConfig.firebaseConfigured) {
      return const SizedBox.shrink();
    }
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: ListTile(
        leading: const Icon(Icons.devices),
        title: Text(l10n.devicesSectionTitle),
        subtitle: Text(l10n.devicesSectionSubtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => DeviceManagementScreen(user: user),
          ),
        ),
      ),
    );
  }
}
