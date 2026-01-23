import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/vehicle_profile.dart';
import 'vehicle_profile_mapper.dart';
import 'vehicle_repository.dart';

class FirestoreVehicleRepository implements VehicleRepository {
  final FirebaseFirestore _firestore;
  final VehicleProfileMapper _mapper;

  FirestoreVehicleRepository({
    FirebaseFirestore? firestore,
    VehicleProfileMapper? mapper,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _mapper = mapper ?? VehicleProfileMapper();

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  CollectionReference<Map<String, dynamic>> _collection(String uid) {
    return _firestore.collection('users').doc(uid).collection('vehicles');
  }

  @override
  Stream<List<VehicleProfile>> watchVehicles(String uid) {
    _ensureConfigured();
    return _collection(uid).orderBy('createdAt', descending: false).snapshots().map(
          (snapshot) => snapshot.docs
              .map((doc) => _mapper.fromDocument(doc.id, doc.data()))
              .toList(),
        );
  }

  @override
  Future<List<VehicleProfile>> fetchVehicles(String uid) async {
    _ensureConfigured();
    final snapshot = await _collection(uid).orderBy('createdAt').get();
    return snapshot.docs
        .map((doc) => _mapper.fromDocument(doc.id, doc.data()))
        .toList();
  }

  @override
  Future<void> saveVehicle(String uid, VehicleProfile vehicle) async {
    _ensureConfigured();
    await _collection(uid).doc(vehicle.id).set(
      {
        ..._mapper.toDocument(vehicle),
        'createdAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  @override
  Future<void> deleteVehicle(String uid, String vehicleId) async {
    _ensureConfigured();
    await _collection(uid).doc(vehicleId).delete();
  }
}
