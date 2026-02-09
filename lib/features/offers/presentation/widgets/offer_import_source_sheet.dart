import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';

enum OfferImportSourceOption { gallery, camera }

Future<OfferImportSourceOption?> showOfferImportSourceSheet(
  BuildContext context,
) {
  return showModalBottomSheet<OfferImportSourceOption>(
    context: context,
    backgroundColor: Colors.transparent,
    isScrollControlled: false,
    builder: (context) => const OfferImportSourceSheet(),
  );
}

class OfferImportSourceSheet extends StatelessWidget {
  const OfferImportSourceSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.symmetric(
          horizontal: ShadcnSpacing.md,
          vertical: ShadcnSpacing.md,
        ),
        padding: const EdgeInsets.fromLTRB(
          ShadcnSpacing.xxl,
          ShadcnSpacing.md,
          ShadcnSpacing.xxl,
          ShadcnSpacing.xl,
        ),
        decoration: BoxDecoration(
          color: ShadcnColors.surface,
          borderRadius: BorderRadius.circular(ShadcnRadius.xl),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.12),
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Align(
              alignment: Alignment.center,
              child: Container(
                width: 48,
                height: 5,
                decoration: BoxDecoration(
                  color: ShadcnColors.outline,
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            const SizedBox(height: ShadcnSpacing.lg),
            Text(
              l10n.importSourceTitle,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: ShadcnSpacing.sm),
            _SourceTile(
              icon: Icons.photo_library_outlined,
              label: l10n.importSourceGallery,
              onTap: () =>
                  Navigator.of(context).pop(OfferImportSourceOption.gallery),
            ),
            const SizedBox(height: ShadcnSpacing.sm),
            _SourceTile(
              icon: Icons.photo_camera_outlined,
              label: l10n.importSourceCamera,
              onTap: () =>
                  Navigator.of(context).pop(OfferImportSourceOption.camera),
            ),
          ],
        ),
      ),
    );
  }
}

class _SourceTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _SourceTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: ShadcnColors.background,
      borderRadius: BorderRadius.circular(ShadcnRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(ShadcnRadius.lg),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: ShadcnSpacing.lg,
            vertical: ShadcnSpacing.md,
          ),
          child: Row(
            children: [
              Icon(icon, color: ShadcnColors.textPrimary),
              const SizedBox(width: ShadcnSpacing.md),
              Expanded(
                child: Text(
                  label,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ),
              const Icon(
                Icons.chevron_right,
                color: ShadcnColors.textSecondary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
