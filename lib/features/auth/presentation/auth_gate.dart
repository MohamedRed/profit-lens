import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/platform/pwa_install.dart';
import '../../../core/widgets/deferred_widget.dart';
import '../../../firebase_bootstrap.dart';
import '../domain/auth_user.dart';
import 'auth_entry_mode.dart';
import 'sign_in_screen.dart';
import '../../profile/presentation/profile_gate.dart' deferred as profile_gate;

class AuthGate extends StatefulWidget {
  final bool forceAuthBootstrap;

  const AuthGate({super.key, this.forceAuthBootstrap = false});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  static const _authStartupDelay = Duration(milliseconds: 700);

  bool _authBootstrapStarted = false;
  bool _authBootstrapInProgress = false;
  Object? _authBootstrapError;
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
    final shouldDeferAuth =
        !widget.forceAuthBootstrap &&
        shouldShowInstallGate(
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

    void startState() {
      _authBootstrapStarted = true;
      _authBootstrapInProgress = true;
      _authBootstrapError = null;
      _authStream = null;
      _initialUser = null;
    }

    if (notify) {
      if (!mounted) {
        return;
      }
      setState(startState);
    } else {
      startState();
    }

    _bootstrapAuth();
  }

  Future<void> _bootstrapAuth() async {
    final services = AppScope.of(context);
    final authRepository = services.authRepository;

    try {
      if (authRepository.requiresFirebaseBootstrap) {
        await FirebaseBootstrap.ensureInitialized();
      }
      if (!mounted) {
        return;
      }
      setState(() {
        _initialUser = authRepository.currentUser();
        _authBootstrapInProgress = false;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _authBootstrapStarted = false;
        _authBootstrapInProgress = false;
        _authBootstrapError = error;
      });
      return;
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

  Widget _buildAuthBootstrapError() {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Authentication startup failed. Please retry.'),
              const SizedBox(height: 12),
              Text(_authBootstrapError.toString(), textAlign: TextAlign.center),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => _startAuthBootstrap(notify: true),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_authBootstrapStarted) {
      return SignInScreen(
        onContinueToSignIn: () => _startAuthBootstrap(notify: true),
      );
    }

    if (_authBootstrapInProgress) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_authBootstrapError != null) {
      return _buildAuthBootstrapError();
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
