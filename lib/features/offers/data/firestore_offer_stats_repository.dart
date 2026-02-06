import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/offer_daily_stats.dart';
import 'mappers/offer_daily_stats_mapper.dart';
import 'offer_stats_repository.dart';

class FirestoreOfferStatsRepository implements OfferStatsRepository {
  final FirebaseFirestore _firestore;
  final OfferDailyStatsMapper _mapper;

  FirestoreOfferStatsRepository({
    FirebaseFirestore? firestore,
    OfferDailyStatsMapper? mapper,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _mapper = mapper ?? OfferDailyStatsMapper();

  CollectionReference<Map<String, dynamic>> _collection(String uid) =>
      _firestore.collection('users').doc(uid).collection('offerStats');

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  @override
  Stream<List<OfferDailyStats>> watchDailyStats(
    String uid, {
    int limit = 90,
  }) {
    _ensureConfigured();
    return _collection(uid)
        .orderBy('dayStart', descending: true)
        .limit(limit)
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => _mapper.fromDocument(doc.data()))
              .whereType<OfferDailyStats>()
              .toList(),
        );
  }
}
