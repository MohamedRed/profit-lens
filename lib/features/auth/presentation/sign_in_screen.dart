import 'package:flutter/material.dart';

import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import 'sign_in_form.dart';

class SignInScreen extends StatelessWidget {
  final VoidCallback? onContinueToSignIn;

  const SignInScreen({super.key, this.onContinueToSignIn});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.signInTitle)),
      backgroundColor: ShadcnColors.background,
      body: SafeArea(
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
            SignInForm(onContinueToSignIn: onContinueToSignIn),
          ],
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
