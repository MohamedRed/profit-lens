import '../domain/device_entry.dart';

abstract class DeviceRepository {
  Stream<List<DeviceEntry>> watchDevices(String uid);
}
