import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';

class SettingsSignOutCard extends StatelessWidget {
  final VoidCallback onSignOut;

  const SettingsSignOutCard({super.key, required this.onSignOut});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: ListTile(
        title: Text(l10n.signOutButton),
        leading: const Icon(Icons.logout),
        onTap: onSignOut,
      ),
    );
  }
}
