import 'package:flutter/material.dart';

import '../../../../core/platform/pwa_install.dart';
import '../../../../l10n/app_localizations.dart';

class SettingsInstallCard extends StatelessWidget {
  const SettingsInstallCard({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ValueListenableBuilder<bool>(
      valueListenable: pwaInstallAvailability,
      builder: (context, available, _) {
        if (isAppleInstallManualAvailable) {
          return Card(
            child: ListTile(
              leading: const Icon(Icons.ios_share),
              title: Text(l10n.installAppIosTitle),
              subtitle: Text(l10n.installAppIosSubtitle),
            ),
          );
        }
        if (!available) {
          return const SizedBox.shrink();
        }
        return Card(
          child: ListTile(
            leading: const Icon(Icons.add_to_home_screen),
            title: Text(l10n.installAppTitle),
            subtitle: Text(l10n.installAppSubtitle),
            onTap: () => showPwaInstallDialog(),
          ),
        );
      },
    );
  }
}
