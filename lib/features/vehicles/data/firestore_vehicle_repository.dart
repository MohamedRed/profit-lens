import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/vehicle_profile.dart';
import '../domain/license_plate.dart';
import 'vehicle_repository_exceptions.dart';
import 'vehicle_profile_mapper.dart';
import 'vehicle_repository.dart';

class FirestoreVehicleRepository implements VehicleRepository {
  final FirebaseFirestore _firestore;
  final VehicleProfileMapper _mapper;

  FirestoreVehicleRepository({
    FirebaseFirestore? firestore,
    VehicleProfileMapper? mapper,
  }) : _firestore = firestore ?? FirebaseFirestore.instance,
       _mapper = mapper ?? VehicleProfileMapper();

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  CollectionReference<Map<String, dynamic>> _collection(String uid) {
    return _firestore.collection('users').doc(uid).collection('vehicles');
  }

  CollectionReference<Map<String, dynamic>> _plateIndexCollection(String uid) {
    return _firestore
        .collection('users')
        .doc(uid)
        .collection('vehiclePlateIndex');
  }

  @override
  Stream<List<VehicleProfile>> watchVehicles(String uid) {
    _ensureConfigured();
    return _collection(uid)
        .orderBy('createdAt', descending: false)
        .snapshots()
        .map(
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
    final vehicleRef = _collection(uid).doc(vehicle.id);
    final plate = _normalizePlate(vehicle.licensePlate);
    final plateRef = plate == null
        ? null
        : _plateIndexCollection(uid).doc(plate);
    await _firestore.runTransaction((transaction) async {
      final existingSnap = await transaction.get(vehicleRef);
      final existingData = existingSnap.data();
      final previousPlate = _normalizePlate(
        existingData?['licensePlate'] as String?,
      );

      if (plateRef != null) {
        final plateSnap = await transaction.get(plateRef);
        if (plateSnap.exists) {
          final linkedVehicleId = plateSnap.data()?['vehicleId'] as String?;
          if (linkedVehicleId != vehicle.id) {
            throw VehiclePlateAlreadyExistsException(plate: plate);
          }
        }
      }

      if (previousPlate != null && previousPlate != plate) {
        transaction.delete(_plateIndexCollection(uid).doc(previousPlate));
      }

      transaction.set(vehicleRef, {
        ..._mapper.toDocument(vehicle),
        'createdAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      if (plateRef != null) {
        final platePayload = <String, dynamic>{
          'vehicleId': vehicle.id,
          'updatedAt': FieldValue.serverTimestamp(),
        };
        transaction.set(plateRef, platePayload, SetOptions(merge: true));
      }
    });
  }

  @override
  Future<void> deleteVehicle(String uid, String vehicleId) async {
    _ensureConfigured();
    final vehicleRef = _collection(uid).doc(vehicleId);
    await _firestore.runTransaction((transaction) async {
      final snapshot = await transaction.get(vehicleRef);
      if (!snapshot.exists) {
        return;
      }
      final plate = _normalizePlate(
        snapshot.data()?['licensePlate'] as String?,
      );
      transaction.delete(vehicleRef);
      if (plate != null) {
        transaction.delete(_plateIndexCollection(uid).doc(plate));
      }
    });
  }

  String? _normalizePlate(String? plate) {
    if (plate == null || plate.trim().isEmpty) {
      return null;
    }
    return normalizeFrenchLicensePlate(plate);
  }
}
