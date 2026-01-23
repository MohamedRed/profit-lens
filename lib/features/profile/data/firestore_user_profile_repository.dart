import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/user_profile.dart';
import 'user_profile_mapper.dart';
import 'user_profile_repository.dart';

class FirestoreUserProfileRepository implements UserProfileRepository {
  final FirebaseFirestore _firestore;
  final UserProfileMapper _mapper;

  FirestoreUserProfileRepository({
    FirebaseFirestore? firestore,
    UserProfileMapper? mapper,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _mapper = mapper ?? UserProfileMapper();

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  DocumentReference<Map<String, dynamic>> _doc(String uid) {
    return _firestore.collection('users').doc(uid);
  }

  @override
  Stream<UserProfile?> watchProfile(String uid) {
    _ensureConfigured();
    return _doc(uid).snapshots().map(
          (snapshot) => _mapper.fromDocument(uid, snapshot.data()),
        );
  }

  @override
  Future<UserProfile?> fetchProfile(String uid) async {
    _ensureConfigured();
    final snapshot = await _doc(uid).get();
    if (!snapshot.exists) return null;
    return _mapper.fromDocument(uid, snapshot.data());
  }

  @override
  Future<void> saveProfile(UserProfile profile) async {
    _ensureConfigured();
    final doc = _doc(profile.uid);
    final existing = await doc.get();
    final data = _mapper.toDocument(profile);
    data['updatedAt'] = FieldValue.serverTimestamp();
    if (!existing.exists) {
      data['createdAt'] = FieldValue.serverTimestamp();
    }
    await doc.set(data, SetOptions(merge: true));
  }
}
