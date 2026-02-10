import 'dart:typed_data';

import 'help_audio_transcription_payload.dart';

Future<HelpAudioTranscriptionPayload> prepareWebHelpAudioTranscriptionPayload({
  required Uint8List bytes,
  required String contentType,
}) async {
  return HelpAudioTranscriptionPayload(
    bytes: bytes,
    contentType: contentType,
  );
}
