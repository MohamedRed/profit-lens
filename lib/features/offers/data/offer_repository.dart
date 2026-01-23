import '../domain/offer_record.dart';

abstract class OfferRepository {
  Future<void> saveOffer(String uid, OfferRecord offer);
  Stream<List<OfferRecord>> watchOffers(String uid);
  Future<List<OfferRecord>> fetchOffers(String uid);
}
