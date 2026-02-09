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
        if (!available && !isAppleInstallManualAvailable) {
          return const SizedBox.shrink();
        }
        return ListTile(
          leading: Icon(
            isAppleInstallManualAvailable
                ? Icons.ios_share
                : Icons.add_to_home_screen,
          ),
          title: Text(l10n.installAppTitle),
          subtitle: Text(l10n.installAppSubtitle),
          onTap: () => showPwaInstallDialog(),
        );
      },
    );
  }
}
