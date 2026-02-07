import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';

class OfferScreenshotPreview extends StatelessWidget {
  final Uint8List thumbnail;

  const OfferScreenshotPreview({
    super.key,
    required this.thumbnail,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Container(
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
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
