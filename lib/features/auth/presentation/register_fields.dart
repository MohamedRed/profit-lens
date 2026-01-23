import 'package:flutter/material.dart';

import '../../../core/widgets/primary_button.dart';
import '../../../l10n/app_localizations.dart';

class RegisterFields extends StatelessWidget {
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController confirmController;
  final bool isLoading;
  final VoidCallback onSubmit;

  const RegisterFields({
    super.key,
    required this.emailController,
    required this.passwordController,
    required this.confirmController,
    required this.isLoading,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        TextFormField(
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
          controller: passwordController,
          obscureText: true,
          decoration: InputDecoration(labelText: l10n.passwordLabel),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return l10n.requiredFieldError;
            }
            if (value.length < 8) {
              return l10n.passwordLengthError;
            }
            return null;
          },
        ),
        const SizedBox(height: 12),
        TextFormField(
          controller: confirmController,
          obscureText: true,
          decoration: InputDecoration(labelText: l10n.confirmPasswordLabel),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return l10n.requiredFieldError;
            }
            if (value != passwordController.text) {
              return l10n.passwordMismatchError;
            }
            return null;
          },
        ),
        const SizedBox(height: 20),
        PrimaryButton(
          label: isLoading ? l10n.loadingLabel : l10n.registerButton,
          onPressed: isLoading ? null : onSubmit,
        ),
      ],
    );
  }
}
