import 'package:flutter/material.dart';

import '../core/theme/app_theme.dart';
import '../firebase_bootstrap.dart';
import 'app.dart';

class AppBootstrap extends StatefulWidget {
  const AppBootstrap({super.key});

  @override
  State<AppBootstrap> createState() => _AppBootstrapState();
}

class _AppBootstrapState extends State<AppBootstrap> {
  late final Future<void> _initFuture;

  @override
  void initState() {
    super.initState();
    _initFuture = FirebaseBootstrap.ensureInitialized();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _initFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return MaterialApp(
            theme: AppTheme.light(),
            home: const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            ),
          );
        }
        if (snapshot.hasError) {
          return MaterialApp(
            theme: AppTheme.light(),
            home: const Scaffold(
              body: Center(child: Text('Startup failed. Please refresh.')),
            ),
          );
        }
        return ProfitLensApp();
      },
    );
  }
}
