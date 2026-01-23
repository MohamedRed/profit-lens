import 'package:cloud_firestore/cloud_firestore.dart';

import '../../../core/config/app_config.dart';
import '../domain/offer.dart';
import 'offer_repository.dart';

class FirestoreOfferRepository implements OfferRepository {
  final FirebaseFirestore _firestore;

  FirestoreOfferRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _collection =>
      _firestore.collection('offers');

  void _ensureConfigured() {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
  }

  @override
  Future<void> saveOffer(Offer offer) async {
    _ensureConfigured();
    await _collection.add({
      'payoutEuro': offer.payoutEuro,
      'distanceKm': offer.distanceKm,
      'pickupName': offer.pickupName,
      'pickupAddress': offer.pickupAddress,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  @override
  Stream<List<Offer>> watchOffers() {
    _ensureConfigured();
    return _collection.orderBy('createdAt', descending: true).snapshots().map(
          (snapshot) => snapshot.docs
              .map((doc) => _fromDocument(doc.data()))
              .toList(),
        );
  }

  Offer _fromDocument(Map<String, dynamic> data) {
    return Offer(
      payoutEuro: (data['payoutEuro'] as num?)?.toDouble() ?? 0,
      distanceKm: (data['distanceKm'] as num?)?.toDouble() ?? 0,
      pickupName: data['pickupName'] as String?,
      pickupAddress: data['pickupAddress'] as String?,
    );
  }
}
