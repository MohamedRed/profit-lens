import 'dart:typed_data';

import 'help_image_processing.dart';

Future<HelpProcessedImage> processHelpImageForUploadInternal({
  required Uint8List bytes,
  required String filename,
  required String contentType,
}) async {
  return HelpProcessedImage(
    bytes: bytes,
    filename: filename,
    contentType: contentType,
  );
}
