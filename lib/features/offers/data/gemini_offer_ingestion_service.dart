import 'package:image_picker/image_picker.dart';

import '../../../core/config/app_config.dart';
import '../domain/offer_extraction_result.dart';
import 'offer_ingestion_service.dart';

class GeminiOfferIngestionService implements OfferIngestionService {
  @override
  Future<OfferExtractionResult> extractFromImage(XFile image) {
    if (AppConfig.geminiApiKey.isEmpty) {
      throw StateError('Missing GEMINI_API_KEY.');
    }
    throw UnimplementedError(
      'Wire the Gemini extraction to your Cloud Function endpoint.',
    );
  }
}
