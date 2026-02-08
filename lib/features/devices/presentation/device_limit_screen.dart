import 'package:flutter/material.dart';

import '../../../core/widgets/primary_button.dart';
import '../../../l10n/app_localizations.dart';
import '../domain/device_entry.dart';

class DeviceLimitScreen extends StatelessWidget {
  final List<DeviceEntry> devices;
  final String? currentDeviceId;
  final ValueChanged<String> onReplace;
  final VoidCallback onSignOut;

  const DeviceLimitScreen({
    super.key,
    required this.devices,
    required this.currentDeviceId,
    required this.onReplace,
    required this.onSignOut,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                l10n.deviceLimitTitle,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                l10n.deviceLimitSubtitle,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.separated(
                  itemBuilder: (context, index) {
                    final device = devices[index];
                    final isCurrent = device.id == currentDeviceId;
                    return ListTile(
                      title: Text(device.platform.isEmpty
                          ? l10n.deviceUnknownLabel
                          : device.platform),
                      subtitle: device.lastSeen == null
                          ? null
                          : Text(
                              '${l10n.deviceLastSeenPrefix} '
                              '${MaterialLocalizations.of(context).formatFullDate(device.lastSeen!.toLocal())}',
                            ),
                      trailing: isCurrent
                          ? Text(l10n.deviceCurrentLabel)
                          : TextButton(
                              onPressed: () => onReplace(device.id),
                              child: Text(l10n.deviceReplaceAction),
                            ),
                    );
                  },
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemCount: devices.length,
                ),
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: l10n.signOutButton,
                onPressed: onSignOut,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
