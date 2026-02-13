import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/widgets/deferred_widget.dart';
import '../../../firebase_bootstrap.dart';
import '../domain/auth_user.dart';
import 'sign_in_screen.dart' deferred as sign_in_screen;
import '../../profile/presentation/profile_gate.dart' deferred as profile_gate;

class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
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
    _startAuthBootstrap(notify: false);
  }

  void _startAuthBootstrap({required bool notify}) {
    void startState() {
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

    try {
      if (services.authRequiresFirebaseBootstrap) {
        await FirebaseBootstrap.ensureInitialized();
      }
      final authRepository = services.authRepository;
      if (!mounted) {
        return;
      }
      setState(() {
        _initialUser = authRepository.currentUser();
        _authStream = authRepository.authStateChanges();
        _authBootstrapInProgress = false;
      });
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _authBootstrapInProgress = false;
        _authBootstrapError = error;
      });
    }
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

  Widget _buildSignInScreen() {
    return DeferredWidget(
      loadLibrary: sign_in_screen.loadLibrary,
      loading: const Scaffold(body: Center(child: CircularProgressIndicator())),
      builder: () => sign_in_screen.SignInScreen(),
    );
  }

  Widget _buildProfileGate(AuthUser user) {
    return DeferredWidget(
      loadLibrary: profile_gate.loadLibrary,
      loading: const Scaffold(body: Center(child: CircularProgressIndicator())),
      builder: () => profile_gate.ProfileGate(user: user),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_authBootstrapInProgress) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_authBootstrapError != null) {
      return _buildAuthBootstrapError();
    }

    if (_authStream == null) {
      final initialUser = _initialUser;
      if (initialUser == null) {
        return _buildSignInScreen();
      }
      return _buildProfileGate(initialUser);
    }

    return StreamBuilder<AuthUser?>(
      stream: _authStream,
      initialData: _initialUser,
      builder: (context, snapshot) {
        final user = snapshot.data;
        if (user == null) {
          return _buildSignInScreen();
        }
        return _buildProfileGate(user);
      },
    );
  }
}
