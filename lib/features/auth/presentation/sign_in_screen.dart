import 'package:flutter/material.dart';

import '../../../core/design_system/shadcn_tokens.dart';
import 'sign_in_form.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                    colors: [
                      ShadcnColors.background,
                      ShadcnColors.surface,
                    ],
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
            const SignInForm(),
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
