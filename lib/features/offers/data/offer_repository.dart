import '../domain/offer.dart';

abstract class OfferRepository {
  Future<void> saveOffer(Offer offer);
  Stream<List<Offer>> watchOffers();
}
