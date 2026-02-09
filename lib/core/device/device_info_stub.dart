import 'dart:io' show Platform;

class DeviceInfo {
  final String platform;
  final String userAgent;

  const DeviceInfo({required this.platform, required this.userAgent});
}

DeviceInfo getDeviceInfo() {
  return DeviceInfo(platform: Platform.operatingSystem, userAgent: '');
}
