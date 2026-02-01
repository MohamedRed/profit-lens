import 'package:image_picker/image_picker.dart';

import '../domain/offer_input.dart';
import '../domain/offer_record.dart';
import '../domain/offer_source.dart';

abstract class OfferAnalysisService {
  Future<OfferRecord> analyzeOffer({
    OfferInput? offer,
    XFile? image,
    String? vehicleId,
    OfferSource? source,
  });
}
