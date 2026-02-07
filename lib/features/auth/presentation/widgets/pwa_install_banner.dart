import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../core/platform/pwa_install.dart';
import '../../../../l10n/app_localizations.dart';

class PwaInstallBanner extends StatelessWidget {
  const PwaInstallBanner({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ValueListenableBuilder<bool>(
      valueListenable: pwaInstallAvailability,
      builder: (context, available, _) {
        final show = available || isAppleInstallManualAvailable;
        if (!show) {
          return const SizedBox.shrink();
        }
        final isApple = isAppleInstallManualAvailable;
        return LayoutBuilder(
          builder: (context, constraints) {
            final isCompact = constraints.maxWidth < 360;
            return Container(
              width: double.infinity,
              decoration: BoxDecoration(
                color: ShadcnColors.surface,
                borderRadius: BorderRadius.circular(ShadcnRadius.xl),
                border: Border.all(color: ShadcnColors.outline),
              ),
              padding: const EdgeInsets.all(ShadcnSpacing.lg),
              child: isCompact
                  ? _InstallBannerCompact(
                      isApple: isApple,
                      title: l10n.installAppTitle,
                      subtitle: l10n.installAppSubtitle,
                      ctaLabel: l10n.installAppCta,
                    )
                  : _InstallBannerWide(
                      isApple: isApple,
                      title: l10n.installAppTitle,
                      subtitle: l10n.installAppSubtitle,
                      ctaLabel: l10n.installAppCta,
                    ),
            );
          },
        );
      },
    );
  }
}

class _InstallBannerWide extends StatelessWidget {
  final bool isApple;
  final String title;
  final String subtitle;
  final String ctaLabel;

  const _InstallBannerWide({
    required this.isApple,
    required this.title,
    required this.subtitle,
    required this.ctaLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.max,
      children: [
        _InstallBannerIcon(isApple: isApple),
        const SizedBox(width: ShadcnSpacing.md),
        Expanded(
          child: _InstallBannerText(
            title: title,
            subtitle: subtitle,
          ),
        ),
        const SizedBox(width: ShadcnSpacing.md),
        _InstallBannerButton(label: ctaLabel),
      ],
    );
  }
}

class _InstallBannerCompact extends StatelessWidget {
  final bool isApple;
  final String title;
  final String subtitle;
  final String ctaLabel;

  const _InstallBannerCompact({
    required this.isApple,
    required this.title,
    required this.subtitle,
    required this.ctaLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisSize: MainAxisSize.max,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _InstallBannerIcon(isApple: isApple),
            const SizedBox(width: ShadcnSpacing.md),
            Expanded(
              child: _InstallBannerText(
                title: title,
                subtitle: subtitle,
              ),
            ),
          ],
        ),
        const SizedBox(height: ShadcnSpacing.md),
        SizedBox(
          width: double.infinity,
          child: _InstallBannerButton(label: ctaLabel),
        ),
      ],
    );
  }
}

class _InstallBannerIcon extends StatelessWidget {
  final bool isApple;

  const _InstallBannerIcon({required this.isApple});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: ShadcnColors.surfaceElevated,
        borderRadius: BorderRadius.circular(ShadcnRadius.lg),
      ),
      child: Icon(
        isApple ? Icons.ios_share : Icons.add_to_home_screen,
        color: ShadcnColors.textPrimary,
      ),
    );
  }
}

class _InstallBannerText extends StatelessWidget {
  final String title;
  final String subtitle;

  const _InstallBannerText({
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: ShadcnColors.textPrimary,
              ),
        ),
        const SizedBox(height: ShadcnSpacing.xs),
        Text(
          subtitle,
          maxLines: 3,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: ShadcnColors.textSecondary,
              ),
        ),
      ],
    );
  }
}

class _InstallBannerButton extends StatelessWidget {
  final String label;

  const _InstallBannerButton({required this.label});

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: () => showPwaInstallDialog(),
      style: FilledButton.styleFrom(
        padding: const EdgeInsets.symmetric(
          horizontal: ShadcnSpacing.md,
          vertical: ShadcnSpacing.sm,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ShadcnRadius.md),
        ),
      ),
      child: Text(label),
    );
  }
}
