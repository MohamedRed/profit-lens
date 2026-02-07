import 'package:flutter/material.dart';

import '../design_system/shadcn_tokens.dart';
import '../platform/pwa_update.dart';
import '../../l10n/app_localizations.dart';

class PwaUpdateBanner extends StatelessWidget {
  const PwaUpdateBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<bool>(
      valueListenable: pwaUpdateAvailability,
      builder: (context, available, _) {
        if (!available) {
          return const SizedBox.shrink();
        }
        final l10n = AppLocalizations.of(context)!;
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(ShadcnSpacing.lg),
            child: Align(
              alignment: Alignment.topCenter,
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 520),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: ShadcnColors.surface,
                    borderRadius: BorderRadius.circular(ShadcnRadius.xl),
                    border: Border.all(color: ShadcnColors.outline),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(ShadcnSpacing.lg),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.system_update_alt,
                          color: ShadcnColors.textPrimary,
                        ),
                        const SizedBox(width: ShadcnSpacing.md),
                        Expanded(
                          child: Text(
                            l10n.updateAvailableTitle,
                            style: Theme.of(context)
                                .textTheme
                                .bodyMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                        ),
                        FilledButton(
                          onPressed: () => applyPwaUpdate(),
                          style: FilledButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              horizontal: ShadcnSpacing.md,
                              vertical: ShadcnSpacing.sm,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius:
                                  BorderRadius.circular(ShadcnRadius.md),
                            ),
                          ),
                          child: Text(l10n.updateAvailableCta),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
