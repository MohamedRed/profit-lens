import 'package:flutter/widgets.dart';

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
        color: const Color(0xFFF5F7FB),
        child: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFFFF),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x140B1220),
                        blurRadius: 24,
                        offset: Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
                    child: ValueListenableBuilder<bool>(
                      valueListenable: pwaInstallAvailability,
                      builder: (context, available, _) {
                        final installEnabled =
                            available || isAppleInstallManualAvailable;
                        return Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              copy.title,
                              textAlign: TextAlign.start,
                              style: const TextStyle(
                                fontSize: 24,
                                height: 1.2,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              copy.subtitle,
                              textAlign: TextAlign.start,
                              style: const TextStyle(
                                fontSize: 15,
                                height: 1.4,
                                color: Color(0xFF334155),
                              ),
                            ),
                            const SizedBox(height: 20),
                            Wrap(
                              spacing: 12,
                              runSpacing: 12,
                              children: [
                                _ShellButton(
                                  label: copy.installCta,
                                  primary: true,
                                  enabled: installEnabled,
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
                        );
                      },
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
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
        ? const Color(0xFF0EA5E9)
        : const Color(0xFFEEF2FF);
    final border = primary ? const Color(0xFF0EA5E9) : const Color(0xFFCBD5E1);
    final foreground = primary
        ? const Color(0xFFFFFFFF)
        : const Color(0xFF0F172A);
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
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: border),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
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
  final String title;
  final String subtitle;
  final String installCta;
  final String signInCta;
  final bool isRtl;

  const _InstallCopy({
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
          title: 'Installez ProfitLens',
          subtitle:
              'Ajoutez ProfitLens à votre écran d’accueil pour un démarrage plus rapide.',
          installCta: 'Installer',
          signInCta: 'Se connecter',
        );
      case 'ar':
        return const _InstallCopy(
          title: 'ثبّت ProfitLens',
          subtitle: 'أضف ProfitLens إلى الشاشة الرئيسية لتجربة أسرع.',
          installCta: 'تثبيت',
          signInCta: 'تسجيل الدخول',
          isRtl: true,
        );
      default:
        return const _InstallCopy(
          title: 'Install ProfitLens',
          subtitle:
              'Add ProfitLens to your home screen for faster startup performance.',
          installCta: 'Install',
          signInCta: 'Sign in',
        );
    }
  }
}
