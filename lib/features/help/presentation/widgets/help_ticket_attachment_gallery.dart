import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_attachment.dart';
import '../../domain/help_ticket_attachment_type.dart';
import 'help_audio_player_tile.dart';

class HelpTicketAttachmentGallery extends StatelessWidget {
  final List<HelpTicketAttachment> attachments;

  const HelpTicketAttachmentGallery({super.key, required this.attachments});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final images = attachments
        .where((item) => item.type == HelpTicketAttachmentType.image)
        .toList();
    final audios = attachments
        .where((item) => item.type == HelpTicketAttachmentType.audio)
        .toList();

    if (images.isEmpty && audios.isEmpty) {
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
          if (audios.isNotEmpty) const SizedBox(height: ShadcnSpacing.lg),
        ],
        if (audios.isNotEmpty) ...[
          Text(
            l10n.helpAttachmentsAudioTitle,
            style: Theme.of(context).textTheme.titleSmall,
          ),
          const SizedBox(height: ShadcnSpacing.md),
          ...audios.map(
            (audio) => Padding(
              padding: const EdgeInsets.only(bottom: ShadcnSpacing.md),
              child: HelpAudioPlayerTile(attachment: audio),
            ),
          ),
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
