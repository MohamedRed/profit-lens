import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:profit_lens/features/offers/data/offer_image_picker_service.dart';

class AssetOfferImagePickerService implements OfferImagePickerService {
  final Map<ImageSource, String> assetsBySource;

  const AssetOfferImagePickerService({required this.assetsBySource});

  @override
  Future<XFile?> pickImage({required ImageSource source}) async {
    final assetPath = assetsBySource[source];
    if (assetPath == null) {
      throw StateError('No asset configured for $source.');
    }
    final data = await rootBundle.load(assetPath);
    return XFile.fromData(
      data.buffer.asUint8List(),
      name: assetPath.split('/').last,
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
