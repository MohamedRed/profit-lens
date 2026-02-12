import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/user_profile.dart';
import '../../devices/presentation/device_access_gate.dart';
import 'profile_setup_screen.dart';
import '../../home/presentation/home_screen.dart';

class ProfileGate extends StatefulWidget {
  final AuthUser user;

  const ProfileGate({super.key, required this.user});

  @override
  State<ProfileGate> createState() => _ProfileGateState();
}

class _ProfileGateState extends State<ProfileGate> {
  static const _profileStartupDelay = Duration(milliseconds: 700);

  Stream<UserProfile?>? _profileStream;
  UserProfile? _initialProfile;
  bool _initialFetchDone = false;
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) {
      return;
    }
    _initialized = true;
    final services = AppScope.of(context);
    services.userProfileRepository.fetchProfile(widget.user.uid).then((value) {
      if (!mounted) {
        return;
      }
      setState(() {
        _initialProfile = value;
        _initialFetchDone = true;
      });
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future<void>.delayed(_profileStartupDelay, () {
        if (!mounted) {
          return;
        }
        setState(() {
          _profileStream = services.userProfileRepository.watchProfile(
            widget.user.uid,
          );
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_profileStream == null && !_initialFetchDone) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    if (_profileStream == null) {
      return _buildForProfile(context, _initialProfile);
    }
    return StreamBuilder<UserProfile?>(
      stream: _profileStream,
      initialData: _initialProfile,
      builder: (context, snapshot) {
        return _buildForProfile(context, snapshot.data);
      },
    );
  }

  Widget _buildForProfile(BuildContext context, UserProfile? profile) {
    if (profile == null) {
      return DeviceAccessGate(
        user: widget.user,
        child: ProfileSetupScreen(user: widget.user),
      );
    }
    final localeController = AppScope.of(context).localeController;
    final preferredLocale = profile.preferredLocale ?? 'fr';
    if (localeController.locale.languageCode != preferredLocale) {
      localeController.setLocaleCode(preferredLocale);
    }
    return DeviceAccessGate(
      user: widget.user,
      child: HomeScreen(user: widget.user, profile: profile),
    );
  }
}
