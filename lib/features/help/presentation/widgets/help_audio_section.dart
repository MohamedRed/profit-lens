import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';

class HelpAudioSection extends StatelessWidget {
  final bool isSupported;
  final bool isRecording;
  final bool hasRecording;
  final Duration? recordedDuration;
  final VoidCallback? onToggleRecording;
  final VoidCallback? onClearRecording;

  const HelpAudioSection({
    super.key,
    required this.isSupported,
    required this.isRecording,
    required this.hasRecording,
    required this.recordedDuration,
    required this.onToggleRecording,
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
        if (!isSupported)
          Text(
            l10n.helpAudioNotSupported,
            style: Theme.of(
              context,
            ).textTheme.bodySmall?.copyWith(color: ShadcnColors.textSecondary),
          )
        else ...[
          Row(
            children: [
              OutlinedButton.icon(
                onPressed: onToggleRecording,
                icon: Icon(isRecording ? Icons.stop : Icons.mic_none),
                label: Text(
                  isRecording
                      ? l10n.helpAudioStopButton
                      : l10n.helpAudioRecordButton,
                ),
              ),
              if (hasRecording) ...[
                const SizedBox(width: ShadcnSpacing.md),
                TextButton(
                  onPressed: onClearRecording,
                  child: Text(l10n.helpAudioDeleteButton),
                ),
              ],
            ],
          ),
          if (isRecording) ...[
            const SizedBox(height: ShadcnSpacing.sm),
            Row(
              children: [
                const Icon(Icons.mic, size: 16, color: ShadcnColors.pink),
                const SizedBox(width: ShadcnSpacing.sm),
                Text(
                  l10n.helpAudioRecordingLabel,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: ShadcnColors.textSecondary,
                      ),
                ),
              ],
            ),
          ],
          if (!isRecording && hasRecording) ...[
            const SizedBox(height: ShadcnSpacing.sm),
            Row(
              children: [
                const Icon(Icons.check_circle, size: 16, color: ShadcnColors.teal),
                const SizedBox(width: ShadcnSpacing.sm),
                Text(
                  _formatReadyLabel(l10n, recordedDuration),
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: ShadcnColors.textSecondary,
                      ),
                ),
              ],
            ),
          ],
        ],
      ],
    );
  }
}

String _formatReadyLabel(AppLocalizations l10n, Duration? duration) {
  if (duration == null) {
    return l10n.helpAudioReadyLabel;
  }
  final totalSeconds = duration.inSeconds;
  final minutes = totalSeconds ~/ 60;
  final seconds = totalSeconds % 60;
  final formatted = minutes > 0
      ? '${minutes}m ${seconds.toString().padLeft(2, '0')}s'
      : '${seconds}s';
  return l10n.helpAudioReadyWithDuration(formatted);
}
