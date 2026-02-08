import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

class DeviceIdService {
  static const _storageKey = 'device_id';
  final Uuid _uuid;

  DeviceIdService({Uuid? uuid}) : _uuid = uuid ?? const Uuid();

  Future<String> getDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString(_storageKey);
    if (existing != null && existing.isNotEmpty) {
      return existing;
    }
    final id = _uuid.v4();
    await prefs.setString(_storageKey, id);
    return id;
  }
}
