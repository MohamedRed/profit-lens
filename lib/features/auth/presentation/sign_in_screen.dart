import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import 'sign_in_form.dart';

class SignInScreen extends StatelessWidget {
  const SignInScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.signInTitle)),
      body: const SafeArea(
        child: SignInForm(),
      ),
    );
  }
}
