import 'package:flutter/foundation.dart';

import 'help_audio_capture.dart';

enum HelpAudioError { permissionDenied, notSupported, failed }

class HelpAudioRecorderState {
  final bool isRecording;
  final HelpAudioRecording? recording;
  final HelpAudioError? error;

  const HelpAudioRecorderState({
    required this.isRecording,
    required this.recording,
    required this.error,
  });

  HelpAudioRecorderState copyWith({
    bool? isRecording,
    HelpAudioRecording? recording,
    HelpAudioError? error,
  }) {
    return HelpAudioRecorderState(
      isRecording: isRecording ?? this.isRecording,
      recording: recording ?? this.recording,
      error: error,
    );
  }
}

class HelpAudioRecorderController {
  final HelpAudioCapture _capture;
  final ValueNotifier<HelpAudioRecorderState> state;

  HelpAudioRecorderController({HelpAudioCapture? capture})
      : _capture = capture ?? HelpAudioCapture(),
        state = ValueNotifier(
          const HelpAudioRecorderState(
            isRecording: false,
            recording: null,
            error: null,
          ),
        );

  bool get isSupported => _capture.isSupported;

  Future<HelpAudioError?> toggle() async {
    if (state.value.isRecording) {
      return stop();
    }
    return start();
  }

  Future<HelpAudioError?> start() async {
    if (!isSupported) {
      state.value = state.value.copyWith(
        isRecording: false,
        error: HelpAudioError.notSupported,
      );
      return HelpAudioError.notSupported;
    }
    try {
      await _capture.start();
      state.value = state.value.copyWith(isRecording: true, error: null);
      return null;
    } on HelpAudioCaptureException catch (error) {
      final mapped = _mapError(error.error);
      state.value = state.value.copyWith(isRecording: false, error: mapped);
      return mapped;
    } catch (_) {
      state.value = state.value.copyWith(
        isRecording: false,
        error: HelpAudioError.failed,
      );
      return HelpAudioError.failed;
    }
  }

  Future<HelpAudioError?> stop() async {
    if (!state.value.isRecording) return null;
    state.value = state.value.copyWith(isRecording: false, error: null);
    try {
      final recording = await _capture
          .stop()
          .timeout(const Duration(seconds: 5), onTimeout: () => null);
      state.value = state.value.copyWith(
        recording: recording ?? state.value.recording,
        error: null,
      );
      return null;
    } catch (_) {
      state.value = state.value.copyWith(
        error: HelpAudioError.failed,
      );
      return HelpAudioError.failed;
    }
  }

  void clear() {
    state.value = state.value.copyWith(recording: null, error: null);
  }

  void dispose() {
    _capture.dispose();
    state.dispose();
  }

  HelpAudioError _mapError(HelpAudioCaptureError error) {
    switch (error) {
      case HelpAudioCaptureError.permissionDenied:
        return HelpAudioError.permissionDenied;
      case HelpAudioCaptureError.notSupported:
        return HelpAudioError.notSupported;
      case HelpAudioCaptureError.failed:
        return HelpAudioError.failed;
    }
  }
}
