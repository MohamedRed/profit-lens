import 'dart:typed_data';

import 'help_audio_transcription_payload_stub.dart'
    if (dart.library.html) 'help_audio_transcription_payload_web.dart';

class HelpAudioTranscriptionPayload {
  final Uint8List bytes;
  final String contentType;
  final int? sampleRate;
  final int? channelCount;

  const HelpAudioTranscriptionPayload({
    required this.bytes,
    required this.contentType,
    this.sampleRate,
    this.channelCount,
  });
}

Future<HelpAudioTranscriptionPayload> prepareHelpAudioTranscriptionPayload({
  required Uint8List bytes,
  required String contentType,
}) =>
    prepareWebHelpAudioTranscriptionPayload(
      bytes: bytes,
      contentType: contentType,
    );
