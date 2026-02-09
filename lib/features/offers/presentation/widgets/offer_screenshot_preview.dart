import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';

class OfferScreenshotPreview extends StatelessWidget {
  final Uint8List thumbnail;

  const OfferScreenshotPreview({super.key, required this.thumbnail});

  void _openPreview(BuildContext context) {
    showDialog<void>(
      context: context,
      barrierDismissible: true,
      builder: (context) => Dialog(
        insetPadding: const EdgeInsets.all(ShadcnSpacing.lg),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(ShadcnRadius.lg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Align(
                alignment: Alignment.centerRight,
                child: IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: MaterialLocalizations.of(context).closeButtonTooltip,
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ),
              Flexible(
                child: InteractiveViewer(
                  minScale: 0.8,
                  maxScale: 4,
                  child: Image.memory(thumbnail, fit: BoxFit.contain),
                ),
              ),
              const SizedBox(height: ShadcnSpacing.sm),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _openPreview(context),
        borderRadius: BorderRadius.circular(ShadcnRadius.xl),
        child: Ink(
          decoration: BoxDecoration(
            color: ShadcnColors.surface,
            borderRadius: BorderRadius.circular(ShadcnRadius.xl),
            border: Border.all(color: ShadcnColors.outline),
          ),
          padding: const EdgeInsets.all(ShadcnSpacing.lg),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(ShadcnRadius.lg),
                child: Image.memory(
                  thumbnail,
                  width: 64,
                  height: 64,
                  fit: BoxFit.cover,
                  cacheWidth: 128,
                ),
              ),
              const SizedBox(width: ShadcnSpacing.md),
              Expanded(
                child: Text(
                  l10n.importedScreenshotTitle,
                  style: Theme.of(
                    context,
                  ).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(width: ShadcnSpacing.sm),
              const Icon(
                Icons.open_in_full,
                color: ShadcnColors.textSecondary,
                size: 18,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
