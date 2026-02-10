import 'dart:html' as html;
import 'dart:js_util' as js_util;
import 'dart:math' as math;
import 'dart:typed_data';

import 'help_audio_transcription_payload.dart';

const int _targetSampleRate = 16000;
const int _wavHeaderSize = 44;

Future<HelpAudioTranscriptionPayload> prepareWebHelpAudioTranscriptionPayload({
  required Uint8List bytes,
  required String contentType,
}) async {
  if (bytes.isEmpty) {
    return HelpAudioTranscriptionPayload(
      bytes: bytes,
      contentType: contentType,
    );
  }
  if (contentType.toLowerCase().contains('wav')) {
    return HelpAudioTranscriptionPayload(
      bytes: bytes,
      contentType: contentType,
    );
  }

  final context = _createAudioContext();
  try {
    final decoded = await _decodeAudio(context, bytes);
    final resampled = await _resample(decoded, _targetSampleRate);
    final mono = _mixToMono(resampled);
    final sampleRate = _audioBufferSampleRate(resampled);
    final wavBytes =
        _encodeWav(mono, sampleRate, channelCount: 1);
    return HelpAudioTranscriptionPayload(
      bytes: wavBytes,
      contentType: 'audio/wav',
      sampleRate: sampleRate,
      channelCount: 1,
    );
  } finally {
    await _closeAudioContext(context);
  }
}

Object _createAudioContext() {
  final window = html.window;
  final ctor = js_util.getProperty(window, 'AudioContext') ??
      js_util.getProperty(window, 'webkitAudioContext');
  if (ctor == null) {
    throw StateError('AudioContext not supported.');
  }
  return js_util.callConstructor(ctor, []);
}

Future<Object> _decodeAudio(Object context, Uint8List bytes) async {
  final buffer = _normalizeBuffer(bytes);
  final promise = js_util.callMethod(context, 'decodeAudioData', [buffer]);
  return js_util.promiseToFuture(promise);
}

Future<Object> _resample(Object buffer, int targetSampleRate) async {
  final currentRate = _audioBufferSampleRate(buffer);
  if (currentRate == targetSampleRate) return buffer;
  final duration = _audioBufferDuration(buffer);
  final frameCount = (duration * targetSampleRate).ceil();
  final offline = _createOfflineAudioContext(frameCount, targetSampleRate);
  final source = js_util.callMethod(offline, 'createBufferSource', []);
  js_util.setProperty(source, 'buffer', buffer);
  final destination = js_util.getProperty(offline, 'destination');
  js_util.callMethod(source, 'connect', [destination]);
  js_util.callMethod(source, 'start', [0]);
  final promise = js_util.callMethod(offline, 'startRendering', []);
  return js_util.promiseToFuture(promise);
}

Object _createOfflineAudioContext(int frameCount, int sampleRate) {
  final window = html.window;
  final ctor = js_util.getProperty(window, 'OfflineAudioContext') ??
      js_util.getProperty(window, 'webkitOfflineAudioContext');
  if (ctor == null) {
    throw StateError('OfflineAudioContext not supported.');
  }
  return js_util.callConstructor(ctor, [1, frameCount, sampleRate]);
}

int _audioBufferSampleRate(Object buffer) {
  final rate = js_util.getProperty(buffer, 'sampleRate');
  if (rate is num) return rate.toInt();
  return _targetSampleRate;
}

double _audioBufferDuration(Object buffer) {
  final duration = js_util.getProperty(buffer, 'duration');
  if (duration is num) return duration.toDouble();
  return 0;
}

int _audioBufferChannels(Object buffer) {
  final channels = js_util.getProperty(buffer, 'numberOfChannels');
  if (channels is num) return channels.toInt();
  return 1;
}

int _audioBufferLength(Object buffer) {
  final length = js_util.getProperty(buffer, 'length');
  if (length is num) return length.toInt();
  return 0;
}

Float32List _mixToMono(Object buffer) {
  final channels = _audioBufferChannels(buffer);
  final length = _audioBufferLength(buffer);
  final mono = Float32List(length);
  if (channels <= 1) {
    final data = _channelData(buffer, 0);
    mono.setAll(0, data);
    return mono;
  }
  for (var channel = 0; channel < channels; channel++) {
    final data = _channelData(buffer, channel);
    for (var i = 0; i < length; i++) {
      mono[i] += data[i];
    }
  }
  final scale = 1 / channels;
  for (var i = 0; i < length; i++) {
    mono[i] *= scale;
  }
  return mono;
}

Float32List _channelData(Object buffer, int channel) {
  final data = js_util.callMethod(buffer, 'getChannelData', [channel]);
  if (data is Float32List) return data;
  final length = _audioBufferLength(buffer);
  final fallback = Float32List(length);
  if (data is List) {
    for (var i = 0; i < length && i < data.length; i++) {
      final value = data[i];
      fallback[i] = value is num ? value.toDouble() : 0;
    }
  }
  return fallback;
}

Uint8List _encodeWav(
  Float32List samples,
  int sampleRate, {
  required int channelCount,
}) {
  final dataLength = samples.length * 2;
  final buffer = ByteData(_wavHeaderSize + dataLength);
  _writeAscii(buffer, 0, 'RIFF');
  buffer.setUint32(4, _wavHeaderSize - 8 + dataLength, Endian.little);
  _writeAscii(buffer, 8, 'WAVE');
  _writeAscii(buffer, 12, 'fmt ');
  buffer.setUint32(16, 16, Endian.little);
  buffer.setUint16(20, 1, Endian.little);
  buffer.setUint16(22, channelCount, Endian.little);
  buffer.setUint32(24, sampleRate, Endian.little);
  buffer.setUint32(
    28,
    sampleRate * channelCount * 2,
    Endian.little,
  );
  buffer.setUint16(32, channelCount * 2, Endian.little);
  buffer.setUint16(34, 16, Endian.little);
  _writeAscii(buffer, 36, 'data');
  buffer.setUint32(40, dataLength, Endian.little);

  var offset = _wavHeaderSize;
  for (final sample in samples) {
    final clamped = math.max(-1.0, math.min(1.0, sample));
    final intSample = (clamped * 32767.0).round();
    buffer.setInt16(offset, intSample, Endian.little);
    offset += 2;
  }
  return buffer.buffer.asUint8List();
}

ByteBuffer _normalizeBuffer(Uint8List bytes) {
  if (bytes.offsetInBytes == 0 &&
      bytes.lengthInBytes == bytes.buffer.lengthInBytes) {
    return bytes.buffer;
  }
  return Uint8List.fromList(bytes).buffer;
}

void _writeAscii(ByteData buffer, int offset, String value) {
  for (var i = 0; i < value.length; i++) {
    buffer.setUint8(offset + i, value.codeUnitAt(i));
  }
}

Future<void> _closeAudioContext(Object context) async {
  if (!js_util.hasProperty(context, 'close')) return;
  try {
    final promise = js_util.callMethod(context, 'close', []);
    await js_util.promiseToFuture(promise);
  } catch (_) {}
}
