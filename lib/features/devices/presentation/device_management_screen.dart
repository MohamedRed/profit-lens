import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/device_entry.dart';

class DeviceManagementScreen extends StatelessWidget {
  final AuthUser user;

  const DeviceManagementScreen({
    super.key,
    required this.user,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.deviceManagementTitle),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(ShadcnSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.deviceManagementSubtitle,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: ShadcnColors.textSecondary,
                    ),
              ),
              const SizedBox(height: ShadcnSpacing.lg),
              Expanded(child: _DeviceList(user: user)),
            ],
          ),
        ),
      ),
    );
  }
}

class _DeviceList extends StatelessWidget {
  final AuthUser user;

  const _DeviceList({required this.user});

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);
    return FutureBuilder<String>(
      future: services.deviceIdService.getDeviceId(),
      builder: (context, deviceSnapshot) {
        final currentDeviceId = deviceSnapshot.data;
        return StreamBuilder<List<DeviceEntry>>(
          stream: services.deviceRepository.watchDevices(user.uid),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting &&
                !snapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }
            final devices = snapshot.data ?? [];
            if (devices.isEmpty) {
              return const SizedBox.shrink();
            }
            return ListView.separated(
              itemBuilder: (context, index) {
                final device = devices[index];
                final isCurrent = currentDeviceId != null &&
                    device.id == currentDeviceId;
                return _DeviceTile(
                  device: device,
                  isCurrent: isCurrent,
                  onRevoke: isCurrent
                      ? null
                      : () => _revokeDevice(context, device.id),
                );
              },
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemCount: devices.length,
            );
          },
        );
      },
    );
  }

  Future<void> _revokeDevice(BuildContext context, String deviceId) async {
    try {
      await AppScope.of(context).deviceRegistryService.revokeDevice(deviceId);
    } catch (error) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }
}

class _DeviceTile extends StatelessWidget {
  final DeviceEntry device;
  final bool isCurrent;
  final VoidCallback? onRevoke;

  const _DeviceTile({
    required this.device,
    required this.isCurrent,
    required this.onRevoke,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final subtitle = device.lastSeen == null
        ? null
        : '${l10n.deviceLastSeenPrefix} '
            '${MaterialLocalizations.of(context).formatFullDate(device.lastSeen!.toLocal())}';
    return ListTile(
      title: Text(
        device.platform.isEmpty ? l10n.deviceUnknownLabel : device.platform,
      ),
      subtitle: subtitle == null ? null : Text(subtitle),
      trailing: isCurrent
          ? Text(l10n.deviceCurrentLabel)
          : TextButton(
              onPressed: onRevoke,
              child: Text(l10n.deviceRevokeAction),
            ),
    );
  }
}
