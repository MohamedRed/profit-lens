import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../core/theme/app_theme.dart';
import '../features/auth/presentation/auth_gate.dart';
import 'app_scope.dart';
import '../l10n/app_localizations.dart';

class ProfitLensApp extends StatelessWidget {
  const ProfitLensApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScope(
      services: AppServices(),
      child: MaterialApp(
        onGenerateTitle: (context) =>
            AppLocalizations.of(context)?.appTitle ?? 'ProfitLens',
        theme: AppTheme.light(),
        localizationsDelegates: const [
          AppLocalizations.delegate,
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('fr'),
          Locale('en'),
          Locale('ar'),
        ],
        home: const AuthGate(),
      ),
    );
  }
}
