import 'package:image_picker/image_picker.dart';

import '../domain/offer_extraction_result.dart';

abstract class OfferIngestionService {
  Future<OfferExtractionResult> extractFromImage(XFile image);
}
