import 'dart:async';
import 'dart:html' as html;
import 'dart:typed_data';

import 'help_audio_capture.dart';

class WebHelpAudioCapture implements HelpAudioCapture {
  html.MediaStream? _stream;
  html.MediaRecorder? _recorder;
  final List<html.Blob> _chunks = [];
  final Stopwatch _stopwatch = Stopwatch();
  String _mimeType = 'audio/webm';

  @override
  bool get isSupported =>
      (html.window as dynamic).MediaRecorder != null &&
      html.window.navigator.mediaDevices != null;

  @override
  Future<void> start() async {
    if (!isSupported) {
      throw HelpAudioCaptureException(HelpAudioCaptureError.notSupported);
    }
    try {
      _stream = await html.window.navigator.mediaDevices?.getUserMedia({
        'audio': true,
      });
    } catch (error) {
      throw HelpAudioCaptureException(
        _mapGetUserMediaError(error),
        message: error.toString(),
      );
    }

    if (_stream == null) {
      throw HelpAudioCaptureException(HelpAudioCaptureError.failed);
    }

    _chunks.clear();
    _stopwatch
      ..reset()
      ..start();

    _mimeType = _resolveMimeType();
    final options =
        _mimeType.isNotEmpty ? <String, dynamic>{'mimeType': _mimeType} : null;
    _recorder =
        options == null ? html.MediaRecorder(_stream!) : html.MediaRecorder(_stream!, options);
    _recorder!.addEventListener('dataavailable', (event) {
      final blobEvent = event as html.BlobEvent;
      final data = blobEvent.data;
      if (data != null) {
        _chunks.add(data);
      }
    });
    _recorder!.start();
  }

  @override
  Future<HelpAudioRecording?> stop() async {
    final recorder = _recorder;
    if (recorder == null) {
      return null;
    }
    final completer = Completer<HelpAudioRecording?>();
    recorder.addEventListener('stop', (_) async {
      _stopwatch.stop();
      final blob = html.Blob(_chunks, _mimeType);
      final bytes = await _blobToBytes(blob);
      final duration = _stopwatch.elapsed;
      final filename = _buildFilename(_mimeType);
      _disposeStream();
      completer.complete(
        HelpAudioRecording(
          bytes: bytes,
          contentType: _mimeType,
          filename: filename,
          duration: duration,
        ),
      );
    });
    recorder.stop();
    return completer.future;
  }

  @override
  Future<void> dispose() async {
    _disposeStream();
  }

  void _disposeStream() {
    _recorder = null;
    _chunks.clear();
    _stopwatch.stop();
    _stream?.getTracks().forEach((track) => track.stop());
    _stream = null;
  }

  HelpAudioCaptureError _mapGetUserMediaError(Object error) {
    if (error is html.DomException) {
      final name = error.name.toLowerCase();
      if (name.contains('notallowed') || name.contains('security')) {
        return HelpAudioCaptureError.permissionDenied;
      }
      if (name.contains('notfound') || name.contains('notreadable')) {
        return HelpAudioCaptureError.failed;
      }
    }
    return HelpAudioCaptureError.failed;
  }

  String _resolveMimeType() {
    const preferred = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/m4a',
    ];
    for (final mime in preferred) {
      if (html.MediaRecorder.isTypeSupported(mime)) {
        return mime;
      }
    }
    return '';
  }

  String _buildFilename(String mimeType) {
    final suffix = mimeType.contains('mp4') || mimeType.contains('m4a')
        ? 'm4a'
        : 'webm';
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    return 'voice-note-$timestamp.$suffix';
  }
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

HelpAudioCapture createHelpAudioCapture() => WebHelpAudioCapture();
