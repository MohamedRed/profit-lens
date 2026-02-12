import 'package:image_picker/image_picker.dart';
import 'package:profit_lens/features/offers/data/offer_image_picker_service.dart';

import '../fixtures/offer_image_fixture.dart';

class AssetOfferImagePickerService implements OfferImagePickerService {
  final Map<ImageSource, OfferImageFixture> fixturesBySource;

  const AssetOfferImagePickerService({required this.fixturesBySource});

  @override
  Future<XFile?> pickImage({required ImageSource source}) async {
    final fixture = fixturesBySource[source];
    if (fixture == null) {
      throw StateError('No asset configured for $source.');
    }
    return XFile.fromData(
      fixture.bytes,
      name: fixture.fileName,
      mimeType: 'image/jpeg',
    );
  }
}

class ThrowingOfferImagePickerService implements OfferImagePickerService {
  const ThrowingOfferImagePickerService();

  @override
  Future<XFile?> pickImage({required ImageSource source}) async {
    throw StateError('Offer image picker not configured for this test.');
  }
}
