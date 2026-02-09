import 'package:cloud_functions/cloud_functions.dart';

import '../../../core/config/firebase_regions.dart';
import '../domain/device_entry.dart';
import 'device_registry_service.dart';

class FirebaseDeviceRegistryService implements DeviceRegistryService {
  final FirebaseFunctions _functions;

  FirebaseDeviceRegistryService({FirebaseFunctions? functions})
    : _functions =
          functions ??
          FirebaseFunctions.instanceFor(region: firebaseFunctionsRegion);

  @override
  Future<DeviceRegistrationResult> registerDevice({
    required String deviceId,
    required String platform,
    required String userAgent,
    String? replaceDeviceId,
  }) async {
    final callable = _functions.httpsCallable('registerDevice');
    final response = await callable.call({
      'deviceId': deviceId,
      'platform': platform,
      'userAgent': userAgent,
      if (replaceDeviceId != null) 'replaceDeviceId': replaceDeviceId,
    });
    return _parseResult(response.data);
  }

  @override
  Future<void> revokeDevice(String deviceId) async {
    final callable = _functions.httpsCallable('revokeDevice');
    await callable.call({'deviceId': deviceId});
  }

  DeviceRegistrationResult _parseResult(Object? data) {
    final map = Map<String, dynamic>.from(data as Map);
    final limit = (map['deviceLimit'] as num?)?.toInt() ?? 1;
    final devices =
        (map['activeDevices'] as List?)
            ?.map((entry) => _parseDevice(entry))
            .whereType<DeviceEntry>()
            .toList() ??
        <DeviceEntry>[];
    return DeviceRegistrationResult(deviceLimit: limit, activeDevices: devices);
  }

  DeviceEntry? _parseDevice(Object? entry) {
    if (entry is! Map) return null;
    final map = Map<String, dynamic>.from(entry as Map);
    return DeviceEntry(
      id: map['deviceId'] as String? ?? '',
      platform: map['platform'] as String? ?? '',
      firstSeen: _parseDate(map['firstSeen']),
      lastSeen: _parseDate(map['lastSeen']),
      active: map['active'] as bool? ?? true,
    );
  }

  DateTime? _parseDate(Object? value) {
    if (value is String && value.isNotEmpty) {
      return DateTime.tryParse(value);
    }
    return null;
  }
}
