import 'dart:typed_data';

abstract class HelpAudioTranscriptionService {
  Future<String?> transcribeAudio({
    required Uint8List bytes,
    required String contentType,
    required String locale,
  });
}
