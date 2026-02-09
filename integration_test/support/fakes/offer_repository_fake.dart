import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:profit_lens/features/offers/data/offer_repository.dart';
import 'package:profit_lens/features/offers/domain/offer_record.dart';

class InMemoryOfferRepository implements OfferRepository {
  final List<OfferRecord> _offers = [];
  final StreamController<List<OfferRecord>> _controller =
      StreamController<List<OfferRecord>>.broadcast();

  @override
  Future<void> saveOffer(String uid, OfferRecord offer) async {
    _offers.add(offer);
    _controller.add(List<OfferRecord>.unmodifiable(_offers));
  }

  @override
  Stream<List<OfferRecord>> watchOffers(String uid) async* {
    yield List<OfferRecord>.unmodifiable(_offers);
    yield* _controller.stream;
  }

  @override
  Future<List<OfferRecord>> fetchOffers(String uid) async =>
      List<OfferRecord>.unmodifiable(_offers);

  @override
  Future<OfferPage> fetchOffersPage(
    String uid, {
    DocumentSnapshot<Map<String, dynamic>>? startAfter,
    int limit = 30,
  }) async {
    // Pagination isn't used in the integration test suite.
    // Returning `hasMore: false` avoids duplicate pages without a Firestore cursor.
    return OfferPage(
      offers: List<OfferRecord>.unmodifiable(_offers),
      lastDocument: null,
      hasMore: false,
    );
  }
}
