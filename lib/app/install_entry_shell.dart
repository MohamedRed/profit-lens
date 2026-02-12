import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../core/design_system/shadcn_tokens.dart';
import '../core/platform/pwa_install.dart';

class InstallEntryShell extends StatelessWidget {
  final VoidCallback onContinueToSignIn;

  const InstallEntryShell({super.key, required this.onContinueToSignIn});

  @override
  Widget build(BuildContext context) {
    final locale = WidgetsBinding.instance.platformDispatcher.locale;
    final copy = _InstallCopy.forLocale(locale.languageCode);
    final textDirection = copy.isRtl ? TextDirection.rtl : TextDirection.ltr;

    return Directionality(
      textDirection: textDirection,
      child: ColoredBox(
        color: ShadcnColors.background,
        child: SafeArea(
          child: Stack(
            children: [
              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [ShadcnColors.background, ShadcnColors.surface],
                    ),
                  ),
                ),
              ),
              Positioned(
                top: -40,
                right: -40,
                child: _GlowBlob(color: ShadcnColors.teal),
              ),
              Positioned(
                bottom: -60,
                left: -20,
                child: _GlowBlob(color: ShadcnColors.pink),
              ),
              LayoutBuilder(
                builder: (context, constraints) {
                  final maxWidth = constraints.maxWidth;
                  final horizontalPadding = math.max(
                    ShadcnSpacing.lg,
                    (maxWidth - 420) / 2,
                  );
                  return Column(
                    children: [
                      _InstallEntryAppBar(title: copy.signInTitle),
                      Expanded(
                        child: ListView(
                          keyboardDismissBehavior:
                              ScrollViewKeyboardDismissBehavior.onDrag,
                          padding: EdgeInsets.fromLTRB(
                            horizontalPadding,
                            ShadcnSpacing.section,
                            horizontalPadding,
                            ShadcnSpacing.section,
                          ),
                          children: [
                            _InstallBannerCard(
                              copy: copy,
                              onContinueToSignIn: onContinueToSignIn,
                            ),
                          ],
                        ),
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InstallEntryAppBar extends StatelessWidget {
  final String title;

  const _InstallEntryAppBar({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        ShadcnSpacing.lg,
        ShadcnSpacing.md,
        ShadcnSpacing.lg,
        ShadcnSpacing.sm,
      ),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: ShadcnColors.textPrimary,
          ),
        ),
      ),
    );
  }
}

class _InstallBannerCard extends StatelessWidget {
  final _InstallCopy copy;
  final VoidCallback onContinueToSignIn;

  const _InstallBannerCard({
    required this.copy,
    required this.onContinueToSignIn,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: pwaInstallAvailability,
      builder: (context, available, _) {
        final isApple = isAppleInstallManualAvailable;
        final isEnabled = available || isApple;
        return Container(
          width: double.infinity,
          decoration: BoxDecoration(
            color: ShadcnColors.surface,
            borderRadius: BorderRadius.circular(ShadcnRadius.xl),
            border: Border.all(color: ShadcnColors.outline),
          ),
          padding: const EdgeInsets.all(ShadcnSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _InstallBannerIcon(isApple: isApple),
                  const SizedBox(width: ShadcnSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          copy.title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: ShadcnColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: ShadcnSpacing.xs),
                        Text(
                          copy.subtitle,
                          style: const TextStyle(
                            fontSize: 14,
                            height: 1.4,
                            color: ShadcnColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: ShadcnSpacing.md),
              Wrap(
                spacing: ShadcnSpacing.sm,
                runSpacing: ShadcnSpacing.sm,
                children: [
                  _ShellButton(
                    label: copy.installCta,
                    primary: true,
                    enabled: isEnabled,
                    onPressed: () {
                      showPwaInstallDialog();
                    },
                  ),
                  _ShellButton(
                    label: copy.signInCta,
                    primary: false,
                    enabled: true,
                    onPressed: onContinueToSignIn,
                  ),
                ],
              ),
            ],
          ),
        );
      },
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
      child: Center(
        child: Text(
          isApple ? '↑' : '+',
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: ShadcnColors.textPrimary,
          ),
        ),
      ),
    );
  }
}

class _GlowBlob extends StatelessWidget {
  final Color color;

  const _GlowBlob({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 180,
      height: 180,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.18),
      ),
    );
  }
}

class _ShellButton extends StatelessWidget {
  final String label;
  final bool primary;
  final bool enabled;
  final VoidCallback onPressed;

  const _ShellButton({
    required this.label,
    required this.primary,
    required this.enabled,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    final background = primary
        ? ShadcnColors.purple
        : ShadcnColors.surfaceElevated;
    final border = primary ? ShadcnColors.purple : ShadcnColors.outline;
    final foreground = primary ? Colors.white : ShadcnColors.textPrimary;
    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: GestureDetector(
        onTap: !enabled
            ? null
            : () {
                onPressed();
              },
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(ShadcnRadius.md),
            border: Border.all(color: border),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: ShadcnSpacing.md,
              vertical: ShadcnSpacing.sm,
            ),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: foreground,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _InstallCopy {
  final String signInTitle;
  final String title;
  final String subtitle;
  final String installCta;
  final String signInCta;
  final bool isRtl;

  const _InstallCopy({
    required this.signInTitle,
    required this.title,
    required this.subtitle,
    required this.installCta,
    required this.signInCta,
    this.isRtl = false,
  });

  static _InstallCopy forLocale(String languageCode) {
    switch (languageCode) {
      case 'fr':
        return const _InstallCopy(
          signInTitle: 'Connexion',
          title: 'Installez ProfitLens',
          subtitle:
              'Ajoutez ProfitLens à votre écran d’accueil pour un démarrage plus rapide.',
          installCta: 'Installer',
          signInCta: 'Se connecter',
        );
      case 'ar':
        return const _InstallCopy(
          signInTitle: 'تسجيل الدخول',
          title: 'ثبّت ProfitLens',
          subtitle: 'أضف ProfitLens إلى الشاشة الرئيسية لتجربة أسرع.',
          installCta: 'تثبيت',
          signInCta: 'تسجيل الدخول',
          isRtl: true,
        );
      default:
        return const _InstallCopy(
          signInTitle: 'Sign in',
          title: 'Install ProfitLens',
          subtitle:
              'Add ProfitLens to your home screen for faster startup performance.',
          installCta: 'Install',
          signInCta: 'Sign in',
        );
    }
  }
}
