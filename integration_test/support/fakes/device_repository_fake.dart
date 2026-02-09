import 'dart:async';

import 'package:profit_lens/features/devices/data/device_repository.dart';
import 'package:profit_lens/features/devices/domain/device_entry.dart';

class InMemoryDeviceRepository implements DeviceRepository {
  InMemoryDeviceRepository({List<DeviceEntry>? initialDevices})
    : _devices = List<DeviceEntry>.from(initialDevices ?? const []);

  final List<DeviceEntry> _devices;
  final StreamController<List<DeviceEntry>> _controller =
      StreamController<List<DeviceEntry>>.broadcast();

  void setDevices(List<DeviceEntry> devices) {
    _devices
      ..clear()
      ..addAll(devices);
    _controller.add(List<DeviceEntry>.unmodifiable(_devices));
  }

  @override
  Stream<List<DeviceEntry>> watchDevices(String uid) async* {
    yield List<DeviceEntry>.unmodifiable(_devices);
    yield* _controller.stream;
  }
}
