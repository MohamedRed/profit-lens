import 'dart:typed_data';

import 'help_image_processing_stub.dart'
    if (dart.library.html) 'help_image_processing_web.dart';

class HelpProcessedImage {
  final Uint8List bytes;
  final String filename;
  final String contentType;

  const HelpProcessedImage({
    required this.bytes,
    required this.filename,
    required this.contentType,
  });
}

Future<HelpProcessedImage> processHelpImageForUpload({
  required Uint8List bytes,
  required String filename,
  required String contentType,
}) =>
    processHelpImageForUploadInternal(
      bytes: bytes,
      filename: filename,
      contentType: contentType,
    );
