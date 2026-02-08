import 'dart:html' as html;

class DeviceInfo {
  final String platform;
  final String userAgent;

  const DeviceInfo({
    required this.platform,
    required this.userAgent,
  });
}

DeviceInfo getDeviceInfo() {
  return DeviceInfo(
    platform: 'web',
    userAgent: html.window.navigator.userAgent,
  );
}
