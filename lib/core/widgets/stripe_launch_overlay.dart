import 'package:flutter/material.dart';

import '../design_system/shadcn_tokens.dart';

class StripeLaunchOverlay {
  const StripeLaunchOverlay._();

  static OverlayEntry show(BuildContext context, String label) {
    final overlay = Overlay.of(context, rootOverlay: true);
    final entry = OverlayEntry(
      builder: (context) => Material(
        color: Colors.black.withOpacity(0.35),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 280),
            child: Container(
              padding: const EdgeInsets.symmetric(
                vertical: ShadcnSpacing.xl,
                horizontal: ShadcnSpacing.xl,
              ),
              decoration: BoxDecoration(
                color: ShadcnColors.surface,
                borderRadius: BorderRadius.circular(ShadcnRadius.lg),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.18),
                    blurRadius: 18,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(
                    width: 28,
                    height: 28,
                    child: CircularProgressIndicator(strokeWidth: 3),
                  ),
                  const SizedBox(height: ShadcnSpacing.md),
                  Text(
                    label,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: ShadcnColors.textPrimary,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
    overlay.insert(entry);
    return entry;
  }
}
