import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/entitlement.dart';
import 'entitlement_repository.dart';

class FirestoreEntitlementRepository implements EntitlementRepository {
  final FirebaseFirestore _firestore;

  FirestoreEntitlementRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  DocumentReference<Map<String, dynamic>> _doc(String uid) {
    return _firestore
        .collection('users')
        .doc(uid)
        .collection('entitlements')
        .doc('current');
  }

  @override
  Stream<Entitlement?> watchEntitlement(String uid) {
    _ensureConfigured();
    return _doc(uid).snapshots().map((snapshot) {
      if (!snapshot.exists) return null;
      return _fromDocument(snapshot.data());
    });
  }

  @override
  Future<Entitlement?> fetchEntitlement(String uid) async {
    _ensureConfigured();
    final snapshot = await _doc(uid).get();
    if (!snapshot.exists) return null;
    return _fromDocument(snapshot.data());
  }

  Entitlement? _fromDocument(Map<String, dynamic>? data) {
    if (data == null) return null;
    final periodStart = (data['periodStart'] as Timestamp?)?.toDate();
    final periodEnd = (data['periodEnd'] as Timestamp?)?.toDate();
    final periodKey = data['periodKey'] as String?;
    if (periodStart == null || periodEnd == null || periodKey == null) {
      return null;
    }
    return Entitlement(
      planId: (data['planId'] as String?) ?? 'free',
      status: (data['status'] as String?) ?? 'free',
      offerLimit: (data['offerLimit'] as num?)?.toInt(),
      deviceLimit: (data['deviceLimit'] as num?)?.toInt() ?? 1,
      periodStart: periodStart,
      periodEnd: periodEnd,
      periodKey: periodKey,
      source: (data['source'] as String?) ?? 'free',
      cancelAtPeriodEnd: (data['cancelAtPeriodEnd'] as bool?) ?? false,
      stripeCustomerId: data['stripeCustomerId'] as String?,
      stripeSubscriptionId: data['stripeSubscriptionId'] as String?,
      stripePriceId: data['stripePriceId'] as String?,
    );
  }
}
