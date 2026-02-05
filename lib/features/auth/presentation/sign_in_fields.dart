import 'package:flutter/material.dart';

import '../../../core/design_system/shadcn_tokens.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../l10n/app_localizations.dart';

class SignInFields extends StatelessWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool isLoading;
  final VoidCallback onSubmit;
  final VoidCallback onCreateAccount;

  const SignInFields({
    super.key,
    required this.emailController,
    required this.passwordController,
    required this.isLoading,
    required this.onSubmit,
    required this.onCreateAccount,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          l10n.signInTitle,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: ShadcnColors.textPrimary,
              ),
        ),
        const SizedBox(height: ShadcnSpacing.lg),
        TextFormField(
          key: const ValueKey('sign_in_email'),
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: _inputDecoration(
            context,
            label: l10n.emailLabel,
            icon: Icons.mail_outline,
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
        const SizedBox(height: ShadcnSpacing.md),
        TextFormField(
          key: const ValueKey('sign_in_password'),
          controller: passwordController,
          obscureText: true,
          decoration: _inputDecoration(
            context,
            label: l10n.passwordLabel,
            icon: Icons.lock_outline,
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
        const SizedBox(height: ShadcnSpacing.xl),
        PrimaryButton(
          key: const ValueKey('sign_in_submit'),
          label: isLoading ? l10n.loadingLabel : l10n.signInButton,
          onPressed: isLoading ? null : onSubmit,
        ),
        const SizedBox(height: ShadcnSpacing.md),
        TextButton(
          key: const ValueKey('sign_in_create_account'),
          onPressed: onCreateAccount,
          child: Text(l10n.createAccountButton),
        ),
      ],
    );
  }

  InputDecoration _inputDecoration(
    BuildContext context, {
    required String label,
    required IconData icon,
  }) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon),
      filled: true,
      fillColor: ShadcnColors.background,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(ShadcnRadius.md),
        borderSide: BorderSide(color: ShadcnColors.outline),
      ),
    );
  }
}
