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
              onTap: () => _showIosInstallInstructions(context, l10n),
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

Future<void> _showIosInstallInstructions(
  BuildContext context,
  AppLocalizations l10n,
) {
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    useSafeArea: true,
    builder: (context) => Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.installAppIosTitle,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            l10n.installAppIosSubtitle,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          _InstructionRow(
            icon: Icons.ios_share,
            text: l10n.installAppIosStepShare,
          ),
          const SizedBox(height: 12),
          _InstructionRow(
            icon: Icons.add_box_outlined,
            text: l10n.installAppIosStepAddHome,
          ),
          const SizedBox(height: 12),
          _InstructionRow(
            icon: Icons.check_circle_outline,
            text: l10n.installAppIosStepConfirm,
          ),
          const SizedBox(height: 16),
        ],
      ),
    ),
  );
}

class _InstructionRow extends StatelessWidget {
  final IconData icon;
  final String text;

  const _InstructionRow({
    required this.icon,
    required this.text,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            text,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
      ],
    );
  }
}
