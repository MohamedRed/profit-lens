import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_attachment.dart';
import '../../domain/help_ticket_attachment_type.dart';

class HelpTicketAttachmentGallery extends StatelessWidget {
  final List<HelpTicketAttachment> attachments;

  const HelpTicketAttachmentGallery({super.key, required this.attachments});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final images = attachments
        .where((item) => item.type == HelpTicketAttachmentType.image)
        .toList();
    final audioNotes = attachments
        .where((item) => item.type == HelpTicketAttachmentType.audio)
        .toList();
    if (images.isEmpty && audioNotes.isEmpty) {
      return Text(
        l10n.helpNoAttachmentsMessage,
        style: Theme.of(
          context,
        ).textTheme.bodySmall?.copyWith(color: ShadcnColors.textSecondary),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (images.isNotEmpty) ...[
          Text(
            l10n.helpAttachmentsScreenshotsTitle,
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: ShadcnSpacing.md),
          _ImageGrid(images: images),
          if (audioNotes.isNotEmpty) const SizedBox(height: ShadcnSpacing.lg),
        ],
        if (audioNotes.isNotEmpty) ...[
          Text(
            l10n.helpAttachmentsAudioTitle,
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: ShadcnSpacing.md),
          _AudioList(audioNotes: audioNotes),
        ],
      ],
    );
  }
}

class _ImageGrid extends StatelessWidget {
  final List<HelpTicketAttachment> images;

  const _ImageGrid({required this.images});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: ShadcnSpacing.sm,
      runSpacing: ShadcnSpacing.sm,
      children: images
          .map(
            (image) => _ImageTile(
              image: image,
              onTap: () => _openImage(context, image),
            ),
          )
          .toList(),
    );
  }

  void _openImage(BuildContext context, HelpTicketAttachment image) {
    showDialog<void>(
      context: context,
      builder: (context) => Dialog(
        insetPadding: const EdgeInsets.all(ShadcnSpacing.lg),
        backgroundColor: Colors.transparent,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(ShadcnRadius.lg),
          child: Container(
            color: Colors.black,
            child: InteractiveViewer(
              child: Image.network(image.url, fit: BoxFit.contain),
            ),
          ),
        ),
      ),
    );
  }
}

class _AudioList extends StatelessWidget {
  final List<HelpTicketAttachment> audioNotes;

  const _AudioList({required this.audioNotes});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: audioNotes
          .map(
            (audio) => Padding(
              padding: const EdgeInsets.only(bottom: ShadcnSpacing.sm),
              child: _AudioTile(audio: audio),
            ),
          )
          .toList(),
    );
  }
}

class _AudioTile extends StatelessWidget {
  final HelpTicketAttachment audio;

  const _AudioTile({required this.audio});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
      decoration: BoxDecoration(
        color: ShadcnColors.surfaceElevated,
        borderRadius: BorderRadius.circular(ShadcnRadius.lg),
      ),
      padding: const EdgeInsets.all(ShadcnSpacing.md),
      child: Row(
        children: [
          const Icon(Icons.mic_none, color: ShadcnColors.purple),
          const SizedBox(width: ShadcnSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  audio.filename.isEmpty
                      ? l10n.helpAudioAttachmentLabel
                      : audio.filename,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                if (audio.durationSeconds != null)
                  Text(
                    _formatDuration(audio.durationSeconds!),
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: ShadcnColors.textSecondary,
                    ),
                  ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.play_arrow),
            tooltip: l10n.helpAudioPlayTooltip,
            onPressed: () => _playAudio(context, audio.url),
          ),
        ],
      ),
    );
  }
}

Future<void> _playAudio(BuildContext context, String url) async {
  final uri = Uri.parse(url);
  final launched = await launchUrl(
    uri,
    mode: LaunchMode.platformDefault,
    webOnlyWindowName: '_blank',
  );
  if (!launched && context.mounted) {
    final l10n = AppLocalizations.of(context)!;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.helpAudioOpenFailed)),
    );
  }
}

String _formatDuration(int totalSeconds) {
  final minutes = totalSeconds ~/ 60;
  final seconds = totalSeconds % 60;
  if (minutes > 0) {
    return '${minutes}m ${seconds.toString().padLeft(2, '0')}s';
  }
  return '${seconds}s';
}

class _ImageTile extends StatelessWidget {
  final HelpTicketAttachment image;
  final VoidCallback onTap;

  const _ImageTile({required this.image, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(ShadcnRadius.md),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(ShadcnRadius.md),
        child: Image.network(
          image.url,
          width: 120,
          height: 120,
          fit: BoxFit.cover,
          cacheWidth: 240,
          cacheHeight: 240,
          filterQuality: FilterQuality.medium,
        ),
      ),
    );
  }
}
