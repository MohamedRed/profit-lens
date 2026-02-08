class DeviceEntry {
  final String id;
  final String platform;
  final DateTime? firstSeen;
  final DateTime? lastSeen;
  final bool active;

  const DeviceEntry({
    required this.id,
    required this.platform,
    required this.firstSeen,
    required this.lastSeen,
    required this.active,
  });
}
