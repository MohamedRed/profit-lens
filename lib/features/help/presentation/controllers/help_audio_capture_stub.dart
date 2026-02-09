import 'help_audio_capture.dart';

class StubHelpAudioCapture implements HelpAudioCapture {
  @override
  bool get isSupported => false;

  @override
  Future<void> start() async {
    throw HelpAudioCaptureException(HelpAudioCaptureError.notSupported);
  }

  @override
  Future<HelpAudioRecording?> stop() async => null;

  @override
  Future<void> dispose() async {}
}

HelpAudioCapture createHelpAudioCapture() => StubHelpAudioCapture();
