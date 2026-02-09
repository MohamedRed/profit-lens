import 'package:profit_lens/features/devices/data/device_registry_service.dart';
import 'package:profit_lens/features/devices/domain/device_entry.dart';

class FakeDeviceRegistryService implements DeviceRegistryService {
  final int deviceLimit;
  final List<DeviceEntry> activeDevices;

  const FakeDeviceRegistryService({
    this.deviceLimit = 1,
    this.activeDevices = const [],
  });

  @override
  Future<DeviceRegistrationResult> registerDevice({
    required String deviceId,
    required String platform,
    required String userAgent,
    String? replaceDeviceId,
  }) async {
    return DeviceRegistrationResult(
      deviceLimit: deviceLimit,
      activeDevices: activeDevices,
    );
  }

  @override
  Future<void> revokeDevice(String deviceId) async {}
}
