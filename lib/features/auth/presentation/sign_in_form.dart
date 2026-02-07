import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../core/platform/pwa_install.dart';
import '../../../l10n/app_localizations.dart';
import 'register_screen.dart';
import 'sign_in_fields.dart';
import 'widgets/pwa_install_banner.dart';

class SignInForm extends StatefulWidget {
  const SignInForm({super.key});

  @override
  State<SignInForm> createState() => _SignInFormState();
}

class _SignInFormState extends State<SignInForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }
    setState(() {
      _isLoading = true;
    });
    final services = AppScope.of(context);
    try {
      await services.authRepository.signInWithEmail(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _openRegister() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => const RegisterScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Form(
      key: _formKey,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final maxWidth = constraints.maxWidth;
          final horizontalPadding = math.max(
            ShadcnSpacing.lg,
            (maxWidth - 420) / 2,
          );
          return ValueListenableBuilder<bool>(
            valueListenable: pwaInstallAvailability,
            builder: (context, _, __) {
              if (!isPwaInstalled) {
                return ListView(
                  keyboardDismissBehavior:
                      ScrollViewKeyboardDismissBehavior.onDrag,
                  padding: EdgeInsets.fromLTRB(
                    horizontalPadding,
                    ShadcnSpacing.section,
                    horizontalPadding,
                    ShadcnSpacing.section,
                  ),
                  children: const [
                    PwaInstallBanner(),
                  ],
                );
              }

              return ListView(
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.onDrag,
                padding: EdgeInsets.fromLTRB(
                  horizontalPadding,
                  ShadcnSpacing.section,
                  horizontalPadding,
                  ShadcnSpacing.section,
                ),
                children: [
                  _AuthHero(
                    title: l10n.appTitle,
                    subtitle: l10n.signInSubtitle,
                  ),
                  const SizedBox(height: ShadcnSpacing.section),
                  Container(
                    decoration: BoxDecoration(
                      color: ShadcnColors.surface,
                      borderRadius: BorderRadius.circular(ShadcnRadius.xl),
                      border: Border.all(color: ShadcnColors.outline),
                    ),
                    padding: const EdgeInsets.all(ShadcnSpacing.xxl),
                    child: SignInFields(
                      emailController: _emailController,
                      passwordController: _passwordController,
                      isLoading: _isLoading,
                      onSubmit: _submit,
                      onCreateAccount: _openRegister,
                    ),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}

class _AuthHero extends StatelessWidget {
  final String title;
  final String subtitle;

  const _AuthHero({
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            color: ShadcnColors.surfaceElevated,
            borderRadius: BorderRadius.circular(ShadcnRadius.pill),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: ShadcnSpacing.md,
              vertical: ShadcnSpacing.xs,
            ),
            child: Text(
              title,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: ShadcnColors.textSecondary,
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
        ),
        const SizedBox(height: ShadcnSpacing.lg),
        Text(
          AppLocalizations.of(context)!.signInTitle,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w700,
                color: ShadcnColors.textPrimary,
              ),
        ),
        const SizedBox(height: ShadcnSpacing.sm),
        Text(
          subtitle,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: ShadcnColors.textSecondary,
              ),
        ),
      ],
    );
  }
}
