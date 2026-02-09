import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_recognition_error.dart';
import 'package:speech_to_text/speech_to_text.dart';

enum HelpSpeechError {
  permissionDenied,
  notAvailable,
  unknown,
}

class HelpSpeechState {
  final bool isListening;
  final HelpSpeechError? error;

  const HelpSpeechState({
    required this.isListening,
    required this.error,
  });

  HelpSpeechState copyWith({
    bool? isListening,
    HelpSpeechError? error,
  }) {
    return HelpSpeechState(
      isListening: isListening ?? this.isListening,
      error: error,
    );
  }
}

class HelpSpeechController {
  final SpeechToText _speech;
  final ValueNotifier<HelpSpeechState> state;
  String _baseText = '';

  HelpSpeechController({SpeechToText? speech})
      : _speech = speech ?? SpeechToText(),
        state = ValueNotifier(
          const HelpSpeechState(
            isListening: false,
            error: null,
          ),
        );

  Future<HelpSpeechError?> toggle({
    required TextEditingController controller,
    String? localeId,
  }) async {
    if (state.value.isListening) {
      await stop();
      return null;
    }
    return _start(controller: controller, localeId: localeId);
  }

  Future<void> stop() async {
    await _speech.stop();
    state.value = state.value.copyWith(isListening: false);
  }

  Future<HelpSpeechError?> _start({
    required TextEditingController controller,
    String? localeId,
  }) async {
    final available = await _speech.initialize(
      onStatus: (status) {
        if (status == 'notListening' || status == 'done') {
          state.value = state.value.copyWith(isListening: false);
        }
      },
      onError: (error) {
        state.value = state.value.copyWith(
          isListening: false,
          error: _mapError(error),
        );
      },
    );

    if (!available || !_speech.isAvailable) {
      state.value = state.value.copyWith(
        isListening: false,
        error: HelpSpeechError.notAvailable,
      );
      return HelpSpeechError.notAvailable;
    }

    if (!await _speech.hasPermission) {
      state.value = state.value.copyWith(
        isListening: false,
        error: HelpSpeechError.permissionDenied,
      );
      return HelpSpeechError.permissionDenied;
    }

    _baseText = controller.text.trim();
    state.value = state.value.copyWith(isListening: true, error: null);

    await _speech.listen(
      onResult: (result) {
        final transcript = result.recognizedWords.trim();
        final combined = _baseText.isEmpty
            ? transcript
            : transcript.isEmpty
                ? _baseText
                : '$_baseText $transcript';
        controller.value = controller.value.copyWith(
          text: combined,
          selection: TextSelection.collapsed(offset: combined.length),
        );
      },
      listenOptions: SpeechListenOptions(
        listenMode: ListenMode.dictation,
        partialResults: true,
      ),
      localeId: localeId,
    );
    return null;
  }

  HelpSpeechError _mapError(SpeechRecognitionError error) {
    final message = error.errorMsg.toLowerCase();
    if (message.contains('permission') || message.contains('not-allowed')) {
      return HelpSpeechError.permissionDenied;
    }
    if (message.contains('not-available') || message.contains('unavailable')) {
      return HelpSpeechError.notAvailable;
    }
    return HelpSpeechError.unknown;
  }

  void dispose() {
    _speech.stop();
    state.dispose();
  }
}
