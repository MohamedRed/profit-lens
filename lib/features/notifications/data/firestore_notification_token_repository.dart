import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import 'notification_token_repository.dart';

class FirestoreNotificationTokenRepository
    implements NotificationTokenRepository {
  final FirebaseFirestore _firestore;

  FirestoreNotificationTokenRepository({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  CollectionReference<Map<String, dynamic>> _collection(String uid) {
    return _firestore
        .collection('users')
        .doc(uid)
        .collection('notificationTokens');
  }

  @override
  Future<void> upsertToken({
    required String uid,
    required String token,
    required String platform,
    required String deviceId,
  }) async {
    _ensureConfigured();
    final ref = _collection(uid).doc(token);
    await ref.set({
      'token': token,
      'platform': platform,
      'deviceId': deviceId,
      'updatedAt': FieldValue.serverTimestamp(),
      'createdAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  @override
  Future<void> deleteToken({required String uid, required String token}) async {
    _ensureConfigured();
    await _collection(uid).doc(token).delete();
  }
}
