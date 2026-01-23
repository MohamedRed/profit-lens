import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import 'register_form.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.registerTitle)),
      body: const SafeArea(
        child: RegisterForm(),
      ),
    );
  }
}
