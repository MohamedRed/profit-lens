import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../offers/presentation/offer_flow_screen.dart';
import '../../offers/presentation/offer_history_screen.dart';
import '../../profile/domain/user_profile.dart';
import '../../settings/presentation/settings_screen.dart';
import '../../../l10n/app_localizations.dart';

class HomeScreen extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;

  const HomeScreen({
    super.key,
    required this.user,
    required this.profile,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final pages = [
      OfferFlowScreen(user: widget.user, profile: widget.profile),
      OfferHistoryScreen(user: widget.user),
      SettingsScreen(user: widget.user, profile: widget.profile),
    ];

    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.add_circle_outline),
            label: l10n.offerTabLabel,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.history),
            label: l10n.historyTabLabel,
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.settings),
            label: l10n.settingsTabLabel,
          ),
        ],
      ),
    );
  }
}
