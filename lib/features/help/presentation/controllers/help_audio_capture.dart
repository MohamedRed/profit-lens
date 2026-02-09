import 'dart:typed_data';

import 'help_audio_capture_stub.dart'
    if (dart.library.html) 'help_audio_capture_web.dart';

enum HelpAudioCaptureError { notSupported, permissionDenied, failed }

class HelpAudioCaptureException implements Exception {
  final HelpAudioCaptureError error;
  final String? message;

  HelpAudioCaptureException(this.error, {this.message});
}

class HelpAudioRecording {
  final Uint8List bytes;
  final String contentType;
  final String filename;
  final Duration duration;

  const HelpAudioRecording({
    required this.bytes,
    required this.contentType,
    required this.filename,
    required this.duration,
  });
}

abstract class HelpAudioCapture {
  bool get isSupported;
  Future<void> start();
  Future<HelpAudioRecording?> stop();
  Future<void> dispose();

  factory HelpAudioCapture() => createHelpAudioCapture();
}
