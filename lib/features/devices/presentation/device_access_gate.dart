import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/config/app_config.dart';
import '../../../core/device/device_id_service.dart';
import '../../../core/device/device_info.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../data/device_registry_service.dart';
import '../domain/device_entry.dart';
import 'device_limit_screen.dart';

class DeviceAccessGate extends StatefulWidget {
  final AuthUser user;
  final Widget child;

  const DeviceAccessGate({
    super.key,
    required this.user,
    required this.child,
  });

  @override
  State<DeviceAccessGate> createState() => _DeviceAccessGateState();
}

class _DeviceAccessGateState extends State<DeviceAccessGate> {
  DeviceRegistrationResult? _result;
  List<DeviceEntry>? _blockedDevices;
  bool _isLoading = true;
  String? _deviceId;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    if (AppConfig.firebaseConfigured) {
      _register();
    } else {
      _isLoading = false;
    }
  }

  Future<void> _register({String? replaceDeviceId}) async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    final services = AppScope.of(context);
    try {
      final deviceId = await services.deviceIdService.getDeviceId();
      _deviceId = deviceId;
      final info = getDeviceInfo();
      final result = await services.deviceRegistryService.registerDevice(
        deviceId: deviceId,
        platform: info.platform,
        userAgent: info.userAgent,
        replaceDeviceId: replaceDeviceId,
      );
      if (!mounted) return;
      setState(() {
        _result = result;
        _blockedDevices = null;
        _isLoading = false;
      });
    } on FirebaseFunctionsException catch (error) {
      if (!mounted) return;
      if (error.code == 'resource-exhausted') {
        final devices = _parseActiveDevices(error.details);
        setState(() {
          _blockedDevices = devices;
          _isLoading = false;
        });
        return;
      }
      setState(() {
        _errorMessage = error.message ?? error.code;
        _isLoading = false;
      });
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _errorMessage = error.toString();
        _isLoading = false;
      });
    }
  }

  List<DeviceEntry> _parseActiveDevices(Object? details) {
    if (details is! Map) return const [];
    final map = Map<String, dynamic>.from(details as Map);
    final list = map['activeDevices'];
    if (list is! List) return const [];
    return list
        .map((entry) {
          if (entry is! Map) return null;
          final data = Map<String, dynamic>.from(entry as Map);
          return DeviceEntry(
            id: data['deviceId'] as String? ?? '',
            platform: data['platform'] as String? ?? '',
            firstSeen: _parseDate(data['firstSeen']),
            lastSeen: _parseDate(data['lastSeen']),
            active: data['active'] as bool? ?? true,
          );
        })
        .whereType<DeviceEntry>()
        .toList();
  }

  DateTime? _parseDate(Object? value) {
    if (value is String && value.isNotEmpty) {
      return DateTime.tryParse(value);
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    if (!AppConfig.firebaseConfigured) {
      return widget.child;
    }
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }
    if (_blockedDevices != null) {
      return DeviceLimitScreen(
        devices: _blockedDevices!,
        currentDeviceId: _deviceId,
        onReplace: (deviceId) => _register(replaceDeviceId: deviceId),
        onSignOut: () => AppScope.of(context).authRepository.signOut(),
      );
    }
    if (_errorMessage != null) {
      final l10n = AppLocalizations.of(context)!;
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  l10n.deviceRegisterFailedTitle,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 8),
                Text(_errorMessage!, textAlign: TextAlign.center),
                const SizedBox(height: 16),
                PrimaryButton(
                  label: l10n.retryButtonLabel,
                  onPressed: _register,
                ),
              ],
            ),
          ),
        ),
      );
    }
    return widget.child;
  }
}
