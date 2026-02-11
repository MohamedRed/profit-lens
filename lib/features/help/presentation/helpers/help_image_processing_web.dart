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

  String? url;
  try {
    final blob = html.Blob([bytes], contentType);
    url = html.Url.createObjectUrlFromBlob(blob);
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

    final width = image.naturalWidth ?? image.width ?? 0;
    final height = image.naturalHeight ?? image.height ?? 0;
    if (width == 0 || height == 0) {
      return HelpProcessedImage(
        bytes: bytes,
        filename: filename,
        contentType: contentType,
      );
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

    var blobResult = await _canvasToBlob(canvas);
    if (blobResult == null) {
      blobResult = _dataUrlToBlob(canvas.toDataUrl('image/jpeg', _jpegQuality));
      if (blobResult == null) {
        return HelpProcessedImage(
          bytes: bytes,
          filename: filename,
          contentType: contentType,
        );
      }
    }

    final processedBytes = await _blobToBytes(blobResult);
    if (processedBytes.isEmpty) {
      return HelpProcessedImage(
        bytes: bytes,
        filename: filename,
        contentType: contentType,
      );
    }

    final safeBase = _stripExtension(filename);
    return HelpProcessedImage(
      bytes: processedBytes,
      filename: '$safeBase.jpg',
      contentType: 'image/jpeg',
    );
  } catch (_) {
    return HelpProcessedImage(
      bytes: bytes,
      filename: filename,
      contentType: contentType,
    );
  } finally {
    if (url != null) {
      html.Url.revokeObjectUrl(url);
    }
  }
}

String _stripExtension(String name) {
  final index = name.lastIndexOf('.');
  if (index <= 0) return name;
  return name.substring(0, index);
}

html.Blob? _dataUrlToBlob(String dataUrl) {
  final commaIndex = dataUrl.indexOf(',');
  if (commaIndex <= 0) return null;
  final metadata = dataUrl.substring(0, commaIndex);
  final base64Data = dataUrl.substring(commaIndex + 1);
  if (!metadata.contains('base64')) return null;
  try {
    final decoded = html.window.atob(base64Data);
    final bytes = Uint8List(decoded.length);
    for (var i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.codeUnitAt(i);
    }
    final mimeMatch = RegExp(r'data:([^;]+);base64').firstMatch(metadata);
    final mimeType = mimeMatch?.group(1) ?? 'image/jpeg';
    return html.Blob([bytes], mimeType);
  } catch (_) {
    return null;
  }
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
