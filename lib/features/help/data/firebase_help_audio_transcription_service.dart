import 'dart:convert';
import 'dart:typed_data';

import 'package:cloud_functions/cloud_functions.dart';

import '../../../core/config/app_config.dart';
import '../../../core/config/firebase_regions.dart';
import 'help_audio_transcription_service.dart';

class FirebaseHelpAudioTranscriptionService
    implements HelpAudioTranscriptionService {
  final FirebaseFunctions _functions;

  FirebaseHelpAudioTranscriptionService({FirebaseFunctions? functions})
      : _functions =
            functions ??
            FirebaseFunctions.instanceFor(region: firebaseFunctionsRegion);

  @override
  Future<String?> transcribeAudio({
    required Uint8List bytes,
    required String contentType,
    required String locale,
  }) async {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
    if (bytes.isEmpty) return null;

    final callable = _functions.httpsCallable('transcribeHelpDraftAudio');
    final response = await callable.call(<String, dynamic>{
      'audio': base64Encode(bytes),
      'contentType': contentType,
      'locale': locale,
    });
    final data = response.data;
    if (data is Map && data['transcript'] is String) {
      final transcript = (data['transcript'] as String).trim();
      return transcript.isEmpty ? null : transcript;
    }
    return null;
  }
}
