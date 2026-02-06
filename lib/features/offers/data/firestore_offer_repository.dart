import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/offer_record.dart';
import 'mappers/offer_record_mapper.dart';
import 'offer_repository.dart';

class FirestoreOfferRepository implements OfferRepository {
  final FirebaseFirestore _firestore;
  final OfferRecordMapper _mapper;

  FirestoreOfferRepository({
    FirebaseFirestore? firestore,
    OfferRecordMapper? mapper,
  })  : _firestore = firestore ?? FirebaseFirestore.instance,
        _mapper = mapper ?? OfferRecordMapper();

  CollectionReference<Map<String, dynamic>> _collection(String uid) =>
      _firestore.collection('users').doc(uid).collection('offers');

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  @override
  Future<void> saveOffer(String uid, OfferRecord offer) async {
    _ensureConfigured();
    final doc = offer.id.isEmpty
        ? _collection(uid).doc()
        : _collection(uid).doc(offer.id);
    await doc.set(
      _mapper.toDocument(offer),
      SetOptions(merge: true),
    );
  }

  @override
  Stream<List<OfferRecord>> watchOffers(String uid) {
    _ensureConfigured();
    return _collection(uid)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => _mapper.fromDocument(doc.id, doc.data()))
              .whereType<OfferRecord>()
              .toList(),
        );
  }

  @override
  Future<List<OfferRecord>> fetchOffers(String uid) async {
    _ensureConfigured();
    final snapshot = await _collection(uid)
        .orderBy('createdAt', descending: true)
        .get();
    return snapshot.docs
        .map((doc) => _mapper.fromDocument(doc.id, doc.data()))
        .whereType<OfferRecord>()
        .toList();
  }

  @override
  Future<OfferPage> fetchOffersPage(
    String uid, {
    DocumentSnapshot<Map<String, dynamic>>? startAfter,
    int limit = 30,
  }) async {
    _ensureConfigured();
    Query<Map<String, dynamic>> query =
        _collection(uid).orderBy('createdAt', descending: true).limit(limit);
    if (startAfter != null) {
      query = query.startAfterDocument(startAfter);
    }
    final snapshot = await query.get();
    final offers = snapshot.docs
        .map((doc) => _mapper.fromDocument(doc.id, doc.data()))
        .whereType<OfferRecord>()
        .toList();
    final lastDocument =
        snapshot.docs.isEmpty ? null : snapshot.docs.last;
    final hasMore = snapshot.docs.length == limit;
    return OfferPage(
      offers: offers,
      lastDocument: lastDocument,
      hasMore: hasMore,
    );
  }
}
