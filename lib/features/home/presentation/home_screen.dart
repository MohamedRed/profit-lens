import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../../auth/domain/auth_user.dart';
import '../../offers/presentation/offer_flow_screen.dart';
import '../../offers/presentation/offer_history_screen.dart';
import '../../profile/domain/user_profile.dart';
import '../../settings/presentation/settings_screen.dart';
import '../../help/presentation/help_screen.dart';
import '../../help/presentation/help_ticket_detail_screen.dart';
import '../../notifications/presentation/notification_registration_coordinator.dart';
import '../../notifications/domain/notification_deep_link.dart';
import '../../../app/app_scope.dart';
import '../../../core/config/app_config.dart';
import '../../../core/widgets/mobile_pill_nav.dart';
import '../../../l10n/app_localizations.dart';
import '../../../core/platform/google_maps_preloader.dart';

class HomeScreen extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;

  const HomeScreen({super.key, required this.user, required this.profile});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  static const int _helpTabIndex = 3;

  int _currentIndex = 0;
  NotificationRegistrationCoordinator? _notificationCoordinator;
  StreamSubscription<RemoteMessage>? _openedAppSubscription;
  bool _initialDeepLinkHandled = false;
  bool _isTicketDetailOpen = false;
  String? _openedTicketId;

  @override
  void initState() {
    super.initState();
    preloadGoogleMaps();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _handleTicketDeepLinkFromUrl();

      if (!AppConfig.firebaseConfigured || kIsWeb) {
        return;
      }
      _listenForNotificationOpens();
      _handleTicketDeepLinkFromInitialNotification();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!AppConfig.firebaseConfigured) return;
    if (_notificationCoordinator != null) return;
    final services = AppScope.of(context);
    _notificationCoordinator = NotificationRegistrationCoordinator(
      repository: services.notificationTokenRepository,
      deviceIdService: services.deviceIdService,
    );
    _notificationCoordinator!.start(
      user: widget.user,
      onForegroundMessage: (message) {
        if (!mounted) return;
        final notification = message.notification;
        final body = notification?.body ?? '';
        final title = notification?.title;
        if ((title == null || title.isEmpty) && body.isEmpty) return;
        final parts = <String>[
          if (title != null && title.isNotEmpty) title,
          if (body.isNotEmpty) body,
        ];
        final text = parts.join(' · ');
        if (text.isEmpty) return;
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(text)));
      },
    );
  }

  @override
  void dispose() {
    _openedAppSubscription?.cancel();
    _notificationCoordinator?.dispose();
    super.dispose();
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
      _HomeTab(
        labelBuilder: (l10n) => l10n.helpTabLabel,
        icon: Icons.help,
        page: HelpScreen(user: widget.user),
      ),
    ];

    return MediaQuery(
      data: MediaQuery.of(context).copyWith(viewInsets: EdgeInsets.zero),
      child: Scaffold(
        backgroundColor: Theme.of(context).colorScheme.background,
        resizeToAvoidBottomInset: false,
        body: IndexedStack(
          index: _currentIndex,
          children: tabs.map((tab) => SafeArea(child: tab.page)).toList(),
        ),
        bottomNavigationBar: MediaQuery.removePadding(
          context: context,
          removeBottom: true,
          child: MediaQuery.removeViewInsets(
            context: context,
            removeBottom: true,
            child: MobilePillNav(
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
          ),
        ),
      ),
    );
  }

  void _listenForNotificationOpens() {
    _openedAppSubscription?.cancel();
    _openedAppSubscription = FirebaseMessaging.onMessageOpenedApp.listen((
      message,
    ) {
      final deepLink = notificationDeepLinkFromMessage(message);
      if (deepLink == null) return;
      _openTicketDetailById(deepLink.ticketId);
    });
  }

  void _handleTicketDeepLinkFromUrl() {
    if (!kIsWeb || _initialDeepLinkHandled) {
      return;
    }
    _initialDeepLinkHandled = true;
    final ticketId = Uri.base.queryParameters['ticketId'] ?? '';
    if (ticketId.isEmpty) {
      return;
    }
    _openTicketDetailById(ticketId);
  }

  Future<void> _handleTicketDeepLinkFromInitialNotification() async {
    if (_initialDeepLinkHandled) return;
    _initialDeepLinkHandled = true;

    final initialMessage = await FirebaseMessaging.instance.getInitialMessage();
    if (!mounted || initialMessage == null) return;
    final deepLink = notificationDeepLinkFromMessage(initialMessage);
    if (deepLink == null) return;
    _openTicketDetailById(deepLink.ticketId);
  }

  void _openTicketDetailById(String ticketId) {
    if (!mounted) return;
    if (_isTicketDetailOpen && _openedTicketId == ticketId) {
      return;
    }
    if (_currentIndex != _helpTabIndex) {
      setState(() => _currentIndex = _helpTabIndex);
    }
    _isTicketDetailOpen = true;
    _openedTicketId = ticketId;
    Navigator.of(context)
        .push(
          MaterialPageRoute(
            builder: (context) =>
                HelpTicketDetailScreen(user: widget.user, ticketId: ticketId),
          ),
        )
        .then((_) {
          _isTicketDetailOpen = false;
          _openedTicketId = null;
        });
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
