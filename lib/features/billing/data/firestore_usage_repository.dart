import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/offer_usage.dart';
import 'usage_repository.dart';

class FirestoreUsageRepository implements UsageRepository {
  final FirebaseFirestore _firestore;

  FirestoreUsageRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  DocumentReference<Map<String, dynamic>> _doc(String uid, String periodKey) {
    return _firestore
        .collection('users')
        .doc(uid)
        .collection('usage')
        .doc(periodKey);
  }

  @override
  Stream<OfferUsage?> watchUsage(String uid, String periodKey) {
    _ensureConfigured();
    return _doc(uid, periodKey).snapshots().map((snapshot) {
      if (!snapshot.exists) return null;
      return _fromDocument(snapshot.data());
    });
  }

  @override
  Future<OfferUsage?> fetchUsage(String uid, String periodKey) async {
    _ensureConfigured();
    final snapshot = await _doc(uid, periodKey).get();
    if (!snapshot.exists) return null;
    return _fromDocument(snapshot.data());
  }

  OfferUsage? _fromDocument(Map<String, dynamic>? data) {
    if (data == null) return null;
    final start = (data['periodStart'] as Timestamp?)?.toDate();
    final end = (data['periodEnd'] as Timestamp?)?.toDate();
    if (start == null || end == null) return null;
    final count = (data['offerCount'] as num?)?.toInt() ?? 0;
    return OfferUsage(periodStart: start, periodEnd: end, offerCount: count);
  }
}
