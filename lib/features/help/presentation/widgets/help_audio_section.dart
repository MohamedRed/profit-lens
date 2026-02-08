import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../controllers/help_audio_recorder_controller.dart';

class HelpAudioSection extends StatelessWidget {
  final ValueListenable<HelpAudioRecorderSnapshot> snapshot;
  final bool isSubmitting;
  final VoidCallback onStartRecording;
  final VoidCallback onStopRecording;
  final VoidCallback onClearRecording;

  const HelpAudioSection({
    super.key,
    required this.snapshot,
    required this.isSubmitting,
    required this.onStartRecording,
    required this.onStopRecording,
    required this.onClearRecording,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.helpAudioTitle,
          style: Theme.of(context).textTheme.titleSmall,
        ),
        const SizedBox(height: ShadcnSpacing.sm),
        Text(
          l10n.helpAudioSubtitle,
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: ShadcnColors.textSecondary),
        ),
        const SizedBox(height: ShadcnSpacing.md),
        ValueListenableBuilder<HelpAudioRecorderSnapshot>(
          valueListenable: snapshot,
          builder: (context, value, _) {
            if (value.isRecording) {
              return _RecordingRow(
                elapsed: value.elapsed,
                isSubmitting: isSubmitting,
                onStop: onStopRecording,
              );
            }
            if (value.attachment != null) {
              return _RecordedRow(
                elapsed: value.elapsed,
                isSubmitting: isSubmitting,
                onClear: onClearRecording,
                onRecordAgain: onStartRecording,
              );
            }
            return OutlinedButton.icon(
              onPressed: isSubmitting ? null : onStartRecording,
              icon: const Icon(Icons.mic),
              label: Text(l10n.helpAudioRecordButton),
            );
          },
        ),
      ],
    );
  }
}

class _RecordingRow extends StatelessWidget {
  final Duration elapsed;
  final bool isSubmitting;
  final VoidCallback onStop;

  const _RecordingRow({
    required this.elapsed,
    required this.isSubmitting,
    required this.onStop,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      padding: const EdgeInsets.all(ShadcnSpacing.md),
      decoration: BoxDecoration(
        color: ShadcnColors.surface,
        borderRadius: BorderRadius.circular(ShadcnRadius.md),
        border: Border.all(color: ShadcnColors.outline),
      ),
      child: Row(
        children: [
          const Icon(Icons.mic, color: ShadcnColors.pink),
          const SizedBox(width: ShadcnSpacing.sm),
          Expanded(
            child: Text(
              '${l10n.helpAudioRecordingLabel} ${_formatElapsed(elapsed)}',
            ),
          ),
          FilledButton(
            onPressed: isSubmitting ? null : onStop,
            child: Text(l10n.helpAudioStopButton),
          ),
        ],
      ),
    );
  }
}

class _RecordedRow extends StatelessWidget {
  final Duration elapsed;
  final bool isSubmitting;
  final VoidCallback onClear;
  final VoidCallback onRecordAgain;

  const _RecordedRow({
    required this.elapsed,
    required this.isSubmitting,
    required this.onClear,
    required this.onRecordAgain,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      padding: const EdgeInsets.all(ShadcnSpacing.md),
      decoration: BoxDecoration(
        color: ShadcnColors.surface,
        borderRadius: BorderRadius.circular(ShadcnRadius.md),
        border: Border.all(color: ShadcnColors.outline),
      ),
      child: Row(
        children: [
          const Icon(Icons.mic_none, color: ShadcnColors.teal),
          const SizedBox(width: ShadcnSpacing.sm),
          Expanded(
            child: Text(
              '${l10n.helpAudioRecordedLabel} ${_formatElapsed(elapsed)}',
            ),
          ),
          TextButton(
            onPressed: isSubmitting ? null : onRecordAgain,
            child: Text(l10n.helpAudioRecordAgainButton),
          ),
          IconButton(
            onPressed: isSubmitting ? null : onClear,
            icon: const Icon(Icons.delete_outline),
            tooltip: l10n.helpAudioRemoveTooltip,
          ),
        ],
      ),
    );
  }
}

String _formatElapsed(Duration duration) {
  final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
  final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
  return '$minutes:$seconds';
}
