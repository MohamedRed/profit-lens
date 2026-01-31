import '../domain/offer_record.dart';
import '../domain/offer_source.dart';
import '../domain/route_verification.dart';
import '../domain/offer.dart';
import '../domain/offer_extraction_metadata.dart';

abstract class OfferAnalysisService {
  Future<OfferRecord> analyzeOffer({
    required Offer offer,
    required RouteVerification? routeVerification,
    required String? vehicleId,
    required OfferSource source,
    OfferExtractionMetadata? extraction,
  });
}
