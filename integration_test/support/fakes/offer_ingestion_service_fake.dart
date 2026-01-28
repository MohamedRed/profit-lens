import 'package:image_picker/image_picker.dart';
import 'package:profit_lens/features/offers/data/offer_ingestion_service.dart';
import 'package:profit_lens/features/offers/domain/offer_extraction_result.dart';

class StubOfferIngestionService implements OfferIngestionService {
  const StubOfferIngestionService();

  @override
  Future<OfferExtractionResult> extractFromImage(XFile image) async {
    return const OfferExtractionResult(
      offer: null,
      confidence: 0,
      rawText: null,
    );
  }
}

class AssetOfferIngestionService implements OfferIngestionService {
  final Map<String, OfferExtractionResult> resultsByName;

  const AssetOfferIngestionService({required this.resultsByName});

  @override
  Future<OfferExtractionResult> extractFromImage(XFile image) async {
    final result = resultsByName[image.name];
    if (result == null) {
      throw StateError('No extraction fixture for ${image.name}.');
    }
    return result;
  }
}
