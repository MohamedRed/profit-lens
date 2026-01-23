import 'offer.dart';

class OfferExtractionResult {
  final Offer? offer;
  final double confidence;
  final String? rawText;

  const OfferExtractionResult({
    required this.offer,
    required this.confidence,
    this.rawText,
  });
}
