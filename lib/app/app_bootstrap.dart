import 'package:flutter/widgets.dart';

import 'app.dart' deferred as full_app;
import 'install_entry_shell.dart';

class AppBootstrap extends StatefulWidget {
  const AppBootstrap({super.key});

  @override
  State<AppBootstrap> createState() => _AppBootstrapState();
}

class _AppBootstrapState extends State<AppBootstrap> {
  late final bool _startInInstallShell = _isInstallEntry();
  bool _fullAppActivated = false;
  bool _forceLoginEntry = false;
  Future<void>? _fullAppLoadFuture;

  @override
  void initState() {
    super.initState();
    if (!_startInInstallShell) {
      _activateFullApp(forceLoginEntry: false);
    }
  }

  bool _isInstallEntry() {
    final entry = Uri.base.queryParameters['entry']?.trim().toLowerCase();
    return entry == 'install';
  }

  void _activateFullApp({required bool forceLoginEntry}) {
    _fullAppActivated = true;
    _forceLoginEntry = forceLoginEntry;
    _fullAppLoadFuture ??= full_app.loadLibrary();
  }

  void _continueToSignIn() {
    if (_fullAppActivated) {
      return;
    }
    setState(() {
      _activateFullApp(forceLoginEntry: true);
    });
  }

  Widget _buildLoader() {
    return const Directionality(
      textDirection: TextDirection.ltr,
      child: ColoredBox(
        color: Color(0xFFF5F7FB),
        child: Center(
          child: Text(
            'Loading ProfitLens...',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Color(0xFF0F172A),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildError(Object? error) {
    return Directionality(
      textDirection: TextDirection.ltr,
      child: ColoredBox(
        color: const Color(0xFFF5F7FB),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Failed to load the app: ${error ?? 'unknown error'}',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, color: Color(0xFF7F1D1D)),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_fullAppActivated) {
      return InstallEntryShell(onContinueToSignIn: _continueToSignIn);
    }

    return FutureBuilder<void>(
      future: _fullAppLoadFuture,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return _buildError(snapshot.error);
        }
        if (snapshot.connectionState != ConnectionState.done) {
          return _buildLoader();
        }
        return full_app.ProfitLensApp(forceLoginEntry: _forceLoginEntry);
      },
    );
  }
}
