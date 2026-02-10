import 'dart:async';
import 'dart:html' as html;
import 'dart:js_util' as js_util;
import 'dart:typed_data';

import 'help_audio_capture.dart';

class WebHelpAudioCapture implements HelpAudioCapture {
  html.MediaStream? _stream;
  Object? _recorder;
  final List<html.Blob> _chunks = [];
  final Stopwatch _stopwatch = Stopwatch();
  String _mimeType = 'audio/webm';

  @override
  bool get isSupported {
    final window = html.window;
    if (!js_util.hasProperty(window, 'MediaRecorder')) {
      return false;
    }
    final navigator = window.navigator;
    return navigator != null && js_util.hasProperty(navigator, 'mediaDevices');
  }

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
    final recorderCtor = js_util.getProperty(html.window, 'MediaRecorder');
    if (recorderCtor == null) {
      throw HelpAudioCaptureException(HelpAudioCaptureError.notSupported);
    }
    final options = _mimeType.isNotEmpty
        ? js_util.jsify(<String, dynamic>{'mimeType': _mimeType})
        : null;
    _recorder = options == null
        ? js_util.callConstructor(recorderCtor, [_stream])
        : js_util.callConstructor(recorderCtor, [_stream, options]);
    js_util.callMethod(_recorder!, 'addEventListener', [
      'dataavailable',
      js_util.allowInterop((event) {
        final data = js_util.getProperty(event, 'data');
        if (data is html.Blob) {
          _chunks.add(data);
        }
      }),
    ]);
    js_util.callMethod(_recorder!, 'start', [1000]);
  }

  @override
  Future<HelpAudioRecording?> stop() async {
    final recorder = _recorder;
    if (recorder == null) {
      return null;
    }
    final completer = Completer<HelpAudioRecording?>();
    var completed = false;
    Timer? timeout;
    void completeOnce(HelpAudioRecording? recording) {
      if (completed) return;
      completed = true;
      timeout?.cancel();
      completer.complete(recording);
    }
    if (js_util.hasProperty(recorder, 'requestData')) {
      try {
        js_util.callMethod(recorder, 'requestData', []);
      } catch (_) {}
    }
    timeout = Timer(const Duration(seconds: 5), () async {
      _stopwatch.stop();
      final recording = await _buildRecordingFromChunks();
      _disposeStream();
      completeOnce(recording);
    });
    js_util.callMethod(recorder, 'addEventListener', [
      'stop',
      js_util.allowInterop((_) async {
        _stopwatch.stop();
        final recording = await _buildRecordingFromChunks();
        _disposeStream();
        completeOnce(recording);
      }),
    ]);
    try {
      js_util.callMethod(recorder, 'stop', []);
    } catch (_) {
      _stopwatch.stop();
      final recording = await _buildRecordingFromChunks();
      _disposeStream();
      completeOnce(recording);
    }
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
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4;codecs=mp4a.40.5',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/m4a',
    ];
    final recorderCtor = js_util.getProperty(html.window, 'MediaRecorder');
    if (recorderCtor == null) {
      return '';
    }
    for (final mime in preferred) {
      final supported =
          js_util.callMethod(recorderCtor, 'isTypeSupported', [mime]) == true;
      if (supported) {
        return mime;
      }
    }
    return '';
  }

  Future<HelpAudioRecording?> _buildRecordingFromChunks() async {
    if (_chunks.isEmpty) {
      return null;
    }
    final blob = _mimeType.isNotEmpty
        ? html.Blob(_chunks, _mimeType)
        : html.Blob(_chunks);
    final bytes = await _blobToBytes(blob);
    if (bytes.isEmpty) {
      return null;
    }
    final contentType = _mimeType.isNotEmpty ? _mimeType : blob.type;
    if (contentType.isEmpty) {
      return null;
    }
    final duration = _stopwatch.elapsed;
    final filename = _buildFilename(contentType);
    return HelpAudioRecording(
      bytes: bytes,
      contentType: contentType,
      filename: filename,
      duration: duration,
    );
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
