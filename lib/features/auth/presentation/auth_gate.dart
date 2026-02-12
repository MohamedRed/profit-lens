import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/platform/pwa_install.dart';
import '../../../core/widgets/deferred_widget.dart';
import '../domain/auth_user.dart';
import 'auth_entry_mode.dart';
import 'sign_in_screen.dart';
import '../../profile/presentation/profile_gate.dart' deferred as profile_gate;

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  static const _authStartupDelay = Duration(milliseconds: 700);

  bool _authBootstrapStarted = false;
  Stream<AuthUser?>? _authStream;
  AuthUser? _initialUser;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) {
      return;
    }
    _initialized = true;
    final shouldDeferAuth = shouldShowInstallGate(
      entryMode: resolveAuthEntryMode(),
      installPromptAvailable: pwaInstallAvailability.value,
    );
    if (!shouldDeferAuth) {
      _startAuthBootstrap(notify: false);
    }
  }

  void _startAuthBootstrap({required bool notify}) {
    if (_authBootstrapStarted) {
      return;
    }
    _authBootstrapStarted = true;
    final services = AppScope.of(context);
    final authRepository = services.authRepository;

    void applyState() {
      _initialUser = authRepository.currentUser();
    }

    if (notify) {
      if (!mounted) {
        return;
      }
      setState(applyState);
    } else {
      applyState();
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future<void>.delayed(_authStartupDelay, () {
        if (!mounted) {
          return;
        }
        setState(() {
          _authStream = authRepository.authStateChanges();
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_authBootstrapStarted) {
      return SignInScreen(
        onContinueToSignIn: () => _startAuthBootstrap(notify: true),
      );
    }

    if (_authStream == null) {
      final initialUser = _initialUser;
      if (initialUser == null) {
        return const SignInScreen();
      }
      return DeferredWidget(
        loadLibrary: profile_gate.loadLibrary,
        loading: const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
        builder: () => profile_gate.ProfileGate(user: initialUser),
      );
    }

    return StreamBuilder<AuthUser?>(
      stream: _authStream,
      initialData: _initialUser,
      builder: (context, snapshot) {
        final user = snapshot.data;
        if (user == null) {
          return const SignInScreen();
        }
        return DeferredWidget(
          loadLibrary: profile_gate.loadLibrary,
          loading: const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          ),
          builder: () => profile_gate.ProfileGate(user: user),
        );
      },
    );
  }
}
