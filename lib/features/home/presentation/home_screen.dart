import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../offers/presentation/offer_flow_screen.dart';
import '../../offers/presentation/offer_history_screen.dart';
import '../../profile/domain/user_profile.dart';
import '../../settings/presentation/settings_screen.dart';
import '../../../core/widgets/mobile_pill_nav.dart';
import '../../../l10n/app_localizations.dart';
import '../../../core/platform/google_maps_preloader.dart';

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
  void initState() {
    super.initState();
    preloadGoogleMaps();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final tabs = [
      _HomeTab(
        labelBuilder: (l10n) => l10n.offerTabLabel,
        icon: Icons.add_circle_outline,
        page: OfferFlowScreen(user: widget.user, profile: widget.profile),
      ),
      _HomeTab(
        labelBuilder: (l10n) => l10n.historyTabLabel,
        icon: Icons.history,
        page: OfferHistoryScreen(user: widget.user),
      ),
      _HomeTab(
        labelBuilder: (l10n) => l10n.settingsTabLabel,
        icon: Icons.settings,
        page: SettingsScreen(user: widget.user, profile: widget.profile),
      ),
    ];

    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.background,
      body: IndexedStack(
        index: _currentIndex,
        children: tabs.map((tab) => SafeArea(child: tab.page)).toList(),
      ),
      bottomNavigationBar: MobilePillNav(
        currentIndex: _currentIndex,
        items: tabs
            .map(
              (tab) => MobilePillNavItem(
                icon: tab.icon,
                label: tab.labelBuilder(l10n),
              ),
            )
            .toList(),
        onChanged: (index) => setState(() => _currentIndex = index),
      ),
    );
  }
}

class _HomeTab {
  final Widget page;
  final IconData icon;
  final String Function(AppLocalizations l10n) labelBuilder;

  _HomeTab({
    required this.page,
    required this.icon,
    required this.labelBuilder,
  });
}
