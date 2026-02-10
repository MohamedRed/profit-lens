import 'dart:async';
import 'dart:html' as html;
import 'dart:math' as math;
import 'dart:typed_data';

import 'help_image_processing.dart';

const double _maxDimension = 1600;
const double _jpegQuality = 0.82;

Future<HelpProcessedImage> processHelpImageForUploadInternal({
  required Uint8List bytes,
  required String filename,
  required String contentType,
}) async {
  if (bytes.isEmpty) {
    throw StateError('Empty image data.');
  }

  final blob = html.Blob([bytes], contentType);
  final url = html.Url.createObjectUrlFromBlob(blob);
  final image = html.ImageElement();
  final completer = Completer<void>();

  image
    ..onLoad.first.then((_) => completer.complete())
    ..onError.first.then((_) {
      if (!completer.isCompleted) {
        completer.completeError(StateError('Failed to decode image.'));
      }
    })
    ..src = url;

  await completer.future;
  html.Url.revokeObjectUrl(url);

  final width = image.naturalWidth ?? image.width ?? 0;
  final height = image.naturalHeight ?? image.height ?? 0;
  if (width == 0 || height == 0) {
    throw StateError('Invalid image dimensions.');
  }

  final scale = math.min(1, _maxDimension / math.max(width, height));
  final targetWidth = (width * scale).round();
  final targetHeight = (height * scale).round();

  final canvas = html.CanvasElement(
    width: targetWidth,
    height: targetHeight,
  );
  final context = canvas.context2D;
  context.drawImageScaled(image, 0, 0, targetWidth, targetHeight);

  final blobResult = await _canvasToBlob(canvas);
  if (blobResult == null) {
    throw StateError('Unable to process image.');
  }

  final processedBytes = await _blobToBytes(blobResult);
  if (processedBytes.isEmpty) {
    throw StateError('Processed image is empty.');
  }

  final safeBase = _stripExtension(filename);
  return HelpProcessedImage(
    bytes: processedBytes,
    filename: '$safeBase.jpg',
    contentType: 'image/jpeg',
  );
}

String _stripExtension(String name) {
  final index = name.lastIndexOf('.');
  if (index <= 0) return name;
  return name.substring(0, index);
}

Future<html.Blob?> _canvasToBlob(html.CanvasElement canvas) {
  return canvas.toBlob('image/jpeg', _jpegQuality);
}

Future<Uint8List> _blobToBytes(html.Blob blob) {
  final reader = html.FileReader();
  final completer = Completer<Uint8List>();
  reader.onLoadEnd.listen((_) {
    final buffer = reader.result as ByteBuffer?;
    if (buffer == null) {
      completer.complete(Uint8List(0));
      return;
    }
    completer.complete(Uint8List.view(buffer));
  });
  reader.readAsArrayBuffer(blob);
  return completer.future;
}
