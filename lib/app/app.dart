import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

import '../core/theme/app_theme.dart';
import '../features/auth/presentation/auth_gate.dart';
import 'app_scope.dart';
import '../l10n/app_localizations.dart';

class ProfitLensApp extends StatelessWidget {
  final AppServices services;

  ProfitLensApp({super.key, AppServices? services})
    : services = services ?? AppServices();

  @override
  Widget build(BuildContext context) {
    return AppScope(
      services: services,
      child: AnimatedBuilder(
        animation: services.localeController,
        builder: (context, _) => MaterialApp(
          locale: services.localeController.locale,
          onGenerateTitle: (context) =>
              AppLocalizations.of(context)?.appTitle ?? 'Liive Profit',
          theme: AppTheme.light(),
          localizationsDelegates: const [
            AppLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [Locale('fr'), Locale('en'), Locale('ar')],
          home: const AuthGate(),
        ),
      ),
    );
  }
}
