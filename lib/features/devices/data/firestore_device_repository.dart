import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/device_entry.dart';
import 'device_repository.dart';

class FirestoreDeviceRepository implements DeviceRepository {
  final FirebaseFirestore _firestore;

  FirestoreDeviceRepository({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  @override
  Stream<List<DeviceEntry>> watchDevices(String uid) {
    _ensureConfigured();
    return _firestore
        .collection('users')
        .doc(uid)
        .collection('devices')
        .orderBy('lastSeen', descending: true)
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => _fromDocument(doc.id, doc.data()))
              .whereType<DeviceEntry>()
              .toList(),
        );
  }

  DeviceEntry? _fromDocument(String id, Map<String, dynamic> data) {
    return DeviceEntry(
      id: id,
      platform: data['platform'] as String? ?? '',
      firstSeen: (data['firstSeen'] as Timestamp?)?.toDate(),
      lastSeen: (data['lastSeen'] as Timestamp?)?.toDate(),
      active: data['active'] as bool? ?? true,
    );
  }
}
