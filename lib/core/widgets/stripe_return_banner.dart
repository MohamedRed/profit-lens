import 'package:flutter/material.dart';

import '../design_system/shadcn_tokens.dart';
import '../platform/stripe_return.dart';
import '../../l10n/app_localizations.dart';

class StripeReturnBanner extends StatelessWidget {
  const StripeReturnBanner({super.key});

  @override
  Widget build(BuildContext context) {
    initStripeReturnPending();
    return ValueListenableBuilder<bool>(
      valueListenable: stripeReturnPending,
      builder: (context, visible, _) {
        if (!visible) {
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
                        const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        const SizedBox(width: ShadcnSpacing.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                l10n.stripeReturnTitle,
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(fontWeight: FontWeight.w600),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                l10n.stripeReturnBody,
                                style: Theme.of(context).textTheme.bodySmall
                                    ?.copyWith(
                                      color: ShadcnColors.textSecondary,
                                    ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(width: ShadcnSpacing.md),
                        TextButton(
                          onPressed: () => stripeReturnPending.value = false,
                          child: Text(l10n.okButton),
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
