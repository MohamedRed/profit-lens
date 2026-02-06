import 'package:cloud_firestore/cloud_firestore.dart';

import '../domain/offer_record.dart';

class OfferPage {
  final List<OfferRecord> offers;
  final DocumentSnapshot<Map<String, dynamic>>? lastDocument;
  final bool hasMore;

  const OfferPage({
    required this.offers,
    required this.lastDocument,
    required this.hasMore,
  });
}

abstract class OfferRepository {
  Future<void> saveOffer(String uid, OfferRecord offer);
  Stream<List<OfferRecord>> watchOffers(String uid);
  Future<List<OfferRecord>> fetchOffers(String uid);
  Future<OfferPage> fetchOffersPage(
    String uid, {
    DocumentSnapshot<Map<String, dynamic>>? startAfter,
    int limit = 30,
  });
}
