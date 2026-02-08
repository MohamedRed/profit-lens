import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../models/help_local_attachment.dart';

class HelpAttachmentSection extends StatelessWidget {
  final List<HelpLocalAttachment> screenshots;
  final bool isSubmitting;
  final VoidCallback onAddFromCamera;
  final VoidCallback onAddFromGallery;
  final ValueChanged<String> onRemove;

  const HelpAttachmentSection({
    super.key,
    required this.screenshots,
    required this.isSubmitting,
    required this.onAddFromCamera,
    required this.onAddFromGallery,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.helpAttachmentTitle,
          style: Theme.of(context).textTheme.titleSmall,
        ),
        const SizedBox(height: ShadcnSpacing.sm),
        Text(
          l10n.helpAttachmentSubtitle,
          style: Theme.of(
            context,
          ).textTheme.bodySmall?.copyWith(color: ShadcnColors.textSecondary),
        ),
        const SizedBox(height: ShadcnSpacing.md),
        if (screenshots.isNotEmpty) ...[
          Wrap(
            spacing: ShadcnSpacing.sm,
            runSpacing: ShadcnSpacing.sm,
            children: screenshots
                .map(
                  (attachment) => _AttachmentThumbnail(
                    attachment: attachment,
                    onRemove: () => onRemove(attachment.id),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: ShadcnSpacing.md),
        ],
        Wrap(
          spacing: ShadcnSpacing.sm,
          runSpacing: ShadcnSpacing.sm,
          children: [
            OutlinedButton.icon(
              onPressed: isSubmitting ? null : onAddFromCamera,
              icon: const Icon(Icons.photo_camera),
              label: Text(l10n.helpAttachmentCameraButton),
            ),
            OutlinedButton.icon(
              onPressed: isSubmitting ? null : onAddFromGallery,
              icon: const Icon(Icons.photo_library),
              label: Text(l10n.helpAttachmentGalleryButton),
            ),
          ],
        ),
      ],
    );
  }
}

class _AttachmentThumbnail extends StatelessWidget {
  final HelpLocalAttachment attachment;
  final VoidCallback onRemove;

  const _AttachmentThumbnail({
    required this.attachment,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(ShadcnRadius.md),
          child: Image.memory(
            attachment.bytes,
            width: 96,
            height: 96,
            fit: BoxFit.cover,
            cacheWidth: 192,
            cacheHeight: 192,
            filterQuality: FilterQuality.medium,
          ),
        ),
        Positioned(
          right: 4,
          top: 4,
          child: Container(
            decoration: const BoxDecoration(
              color: Colors.black54,
              shape: BoxShape.circle,
            ),
            child: IconButton(
              icon: const Icon(Icons.close, size: 16, color: Colors.white),
              onPressed: onRemove,
              constraints: const BoxConstraints.tightFor(width: 28, height: 28),
              padding: EdgeInsets.zero,
              tooltip: AppLocalizations.of(context)!.removeAttachmentTooltip,
            ),
          ),
        ),
      ],
    );
  }
}
