import 'dart:convert';
import 'dart:typed_data';

import '../../../tool/fixtures/offer_image_base64.dart';
import '../../../tool/fixtures/offer_image_base64_second.dart';

class OfferImageFixture {
  final String fileName;
  final Uint8List bytes;

  const OfferImageFixture({required this.fileName, required this.bytes});
}

class OfferImageFixtures {
  static const String galleryFileName = 'IMG-20260122-WA0020.JPG';
  static const String cameraFileName = 'IMG-20260122-WA0021.JPG';

  static final OfferImageFixture gallery = OfferImageFixture(
    fileName: galleryFileName,
    bytes: base64Decode(offerImageBase64),
  );

  static final OfferImageFixture camera = OfferImageFixture(
    fileName: cameraFileName,
    bytes: base64Decode(offerImageBase64Second),
  );
}
