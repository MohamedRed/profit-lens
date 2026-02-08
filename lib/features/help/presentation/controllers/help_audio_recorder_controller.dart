import 'dart:async';

import 'package:cross_file/cross_file.dart';
import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:uuid/uuid.dart';

import '../models/help_local_attachment.dart';
import '../../domain/help_ticket_attachment_type.dart';

class HelpAudioRecorderSnapshot {
  final bool isRecording;
  final Duration elapsed;
  final HelpLocalAttachment? attachment;

  const HelpAudioRecorderSnapshot({
    required this.isRecording,
    required this.elapsed,
    required this.attachment,
  });

  HelpAudioRecorderSnapshot copyWith({
    bool? isRecording,
    Duration? elapsed,
    HelpLocalAttachment? attachment,
  }) {
    return HelpAudioRecorderSnapshot(
      isRecording: isRecording ?? this.isRecording,
      elapsed: elapsed ?? this.elapsed,
      attachment: attachment ?? this.attachment,
    );
  }
}

class HelpAudioRecorderController {
  final AudioRecorder _recorder;
  final Uuid _uuid;
  final ValueNotifier<HelpAudioRecorderSnapshot> snapshot;
  Timer? _ticker;
  DateTime? _startedAt;
  String? _currentPath;
  String? _currentFileName;

  HelpAudioRecorderController({AudioRecorder? recorder, Uuid? uuid})
    : _recorder = recorder ?? AudioRecorder(),
      _uuid = uuid ?? const Uuid(),
      snapshot = ValueNotifier(
        const HelpAudioRecorderSnapshot(
          isRecording: false,
          elapsed: Duration.zero,
          attachment: null,
        ),
      );

  Future<bool> start() async {
    if (snapshot.value.isRecording) {
      return false;
    }
    try {
      final hasPermission = await _recorder.hasPermission();
      if (!hasPermission) {
        return false;
      }
      final fileName = 'help_audio_${_uuid.v4()}.m4a';
      final path = kIsWeb
          ? fileName
          : '${(await getTemporaryDirectory()).path}/$fileName';
      final config = const RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
        numChannels: 1,
      );
      await _recorder.start(config, path: path);
      _currentPath = path;
      _currentFileName = fileName;
      _startedAt = DateTime.now();
      snapshot.value = snapshot.value.copyWith(
        isRecording: true,
        elapsed: Duration.zero,
        attachment: null,
      );
      _ticker?.cancel();
      _ticker = Timer.periodic(const Duration(milliseconds: 500), (_) {
        if (_startedAt == null) return;
        final elapsed = DateTime.now().difference(_startedAt!);
        snapshot.value = snapshot.value.copyWith(elapsed: elapsed);
      });
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<HelpLocalAttachment?> stop() async {
    if (!snapshot.value.isRecording) {
      return null;
    }
    try {
      _ticker?.cancel();
      _ticker = null;
      final path = await _recorder.stop();
      final startedAt = _startedAt;
      _startedAt = null;
      if (path == null && _currentPath == null) {
        snapshot.value = snapshot.value.copyWith(isRecording: false);
        return null;
      }
      final fileName = _currentFileName ?? 'help_audio_${_uuid.v4()}.m4a';
      final resolvedPath = path ?? _currentPath!;
      _currentPath = null;
      _currentFileName = null;
      final duration = startedAt == null
          ? snapshot.value.elapsed
          : DateTime.now().difference(startedAt);
      final audioFile = XFile(
        resolvedPath,
        name: fileName,
        mimeType: 'audio/mp4',
      );
      final bytes = await audioFile.readAsBytes();
      final attachment = HelpLocalAttachment(
        id: _uuid.v4(),
        type: HelpTicketAttachmentType.audio,
        filename: fileName,
        contentType: 'audio/mp4',
        bytes: bytes,
        sizeBytes: bytes.length,
        duration: duration,
      );
      snapshot.value = snapshot.value.copyWith(
        isRecording: false,
        elapsed: duration,
        attachment: attachment,
      );
      return attachment;
    } catch (_) {
      snapshot.value = snapshot.value.copyWith(isRecording: false);
      return null;
    }
  }

  void clearAttachment() {
    snapshot.value = snapshot.value.copyWith(
      isRecording: snapshot.value.isRecording,
      attachment: null,
    );
  }

  Future<void> dispose() async {
    _ticker?.cancel();
    _ticker = null;
    await _recorder.dispose();
    snapshot.dispose();
  }
}
