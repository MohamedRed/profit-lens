import 'package:flutter/material.dart';

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
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextFormField(
          key: const ValueKey('sign_in_email'),
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(labelText: l10n.emailLabel),
          validator: (value) {
            if (value == null || value.trim().isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        TextFormField(
          key: const ValueKey('sign_in_password'),
          controller: passwordController,
          obscureText: true,
          decoration: InputDecoration(labelText: l10n.passwordLabel),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return l10n.requiredFieldError;
            }
            return null;
          },
        ),
        const SizedBox(height: 20),
        PrimaryButton(
          key: const ValueKey('sign_in_submit'),
          label: isLoading ? l10n.loadingLabel : l10n.signInButton,
          onPressed: isLoading ? null : onSubmit,
        ),
        const SizedBox(height: 12),
        TextButton(
          key: const ValueKey('sign_in_create_account'),
          onPressed: onCreateAccount,
          child: Text(l10n.createAccountButton),
        ),
      ],
    );
  }
}
