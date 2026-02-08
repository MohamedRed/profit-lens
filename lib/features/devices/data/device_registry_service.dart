import '../domain/device_entry.dart';

class DeviceRegistrationResult {
  final int deviceLimit;
  final List<DeviceEntry> activeDevices;

  const DeviceRegistrationResult({
    required this.deviceLimit,
    required this.activeDevices,
  });
}

abstract class DeviceRegistryService {
  Future<DeviceRegistrationResult> registerDevice({
    required String deviceId,
    required String platform,
    required String userAgent,
    String? replaceDeviceId,
  });

  Future<void> revokeDevice(String deviceId);
}
