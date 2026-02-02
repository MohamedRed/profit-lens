import 'package:flutter/material.dart';

import '../../../../core/platform/pwa_install.dart';
import '../../../../l10n/app_localizations.dart';

class SettingsInstallCard extends StatelessWidget {
  const SettingsInstallCard({super.key});

  @override
  Widget build(BuildContext context) {
    if (!isPwaInstallAvailable) {
      return const SizedBox.shrink();
    }
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: ListTile(
        leading: const Icon(Icons.add_to_home_screen),
        title: Text(l10n.installAppTitle),
        subtitle: Text(l10n.installAppSubtitle),
        onTap: () => showPwaInstallDialog(),
      ),
    );
  }
}
