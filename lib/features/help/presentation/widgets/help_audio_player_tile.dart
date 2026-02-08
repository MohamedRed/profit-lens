import 'dart:async';

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_attachment.dart';

class HelpAudioPlayerTile extends StatefulWidget {
  final HelpTicketAttachment attachment;

  const HelpAudioPlayerTile({super.key, required this.attachment});

  @override
  State<HelpAudioPlayerTile> createState() => _HelpAudioPlayerTileState();
}

class _HelpAudioPlayerTileState extends State<HelpAudioPlayerTile> {
  late final AudioPlayer _player;
  late final Future<void> _loadFuture;
  StreamSubscription<PlayerState>? _stateSubscription;

  @override
  void initState() {
    super.initState();
    _player = AudioPlayer();
    _loadFuture = _player.setUrl(widget.attachment.url);
    _stateSubscription = _player.playerStateStream.listen((state) {
      if (state.processingState == ProcessingState.completed) {
        _player.seek(Duration.zero);
        _player.pause();
      }
    });
  }

  @override
  void dispose() {
    _stateSubscription?.cancel();
    _player.dispose();
    super.dispose();
  }

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
      child: FutureBuilder<void>(
        future: _loadFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Row(
              children: [
                const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                const SizedBox(width: ShadcnSpacing.sm),
                Text(l10n.helpAudioLoadingLabel),
              ],
            );
          }
          if (snapshot.hasError) {
            return Row(
              children: [
                const Icon(Icons.error_outline, color: Colors.redAccent),
                const SizedBox(width: ShadcnSpacing.sm),
                Expanded(child: Text(l10n.helpAudioPlaybackError)),
              ],
            );
          }
          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  StreamBuilder<PlayerState>(
                    stream: _player.playerStateStream,
                    builder: (context, snapshot) {
                      final isPlaying = snapshot.data?.playing ?? false;
                      return IconButton(
                        icon: Icon(isPlaying ? Icons.pause : Icons.play_arrow),
                        onPressed: () async {
                          if (isPlaying) {
                            await _player.pause();
                          } else {
                            await _player.play();
                          }
                        },
                      );
                    },
                  ),
                  Expanded(child: _PositionSlider(player: _player)),
                ],
              ),
              Text(
                widget.attachment.filename,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: ShadcnColors.textSecondary,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _PositionSlider extends StatelessWidget {
  final AudioPlayer player;

  const _PositionSlider({required this.player});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Duration?>(
      stream: player.durationStream,
      builder: (context, durationSnapshot) {
        final duration = durationSnapshot.data ?? Duration.zero;
        return StreamBuilder<Duration>(
          stream: player.positionStream,
          builder: (context, positionSnapshot) {
            final position = positionSnapshot.data ?? Duration.zero;
            final double max = duration.inMilliseconds
                .toDouble()
                .clamp(1.0, double.infinity)
                .toDouble();
            final double value = position.inMilliseconds
                .toDouble()
                .clamp(0.0, max)
                .toDouble();
            return Row(
              children: [
                Expanded(
                  child: Slider(
                    value: value,
                    max: max,
                    onChanged: (next) {
                      player.seek(Duration(milliseconds: next.round()));
                    },
                  ),
                ),
                Text(
                  _format(position, duration),
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: ShadcnColors.textSecondary,
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  String _format(Duration position, Duration duration) {
    final total = duration.inSeconds > 0 ? duration : position;
    final minutes = total.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = total.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}
