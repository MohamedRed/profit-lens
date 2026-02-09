import 'package:profit_lens/core/device/device_id_service.dart';

class TestDeviceIdService extends DeviceIdService {
  final String deviceId;

  TestDeviceIdService({this.deviceId = 'test-device'});

  @override
  Future<String> getDeviceId() async => deviceId;
}
