import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../../core/widgets/deferred_widget.dart';

import '../../auth/domain/auth_user.dart';
import '../../offers/presentation/offer_flow_screen.dart';
import '../../profile/domain/user_profile.dart';
import '../../notifications/presentation/notification_registration_coordinator.dart';
import '../../notifications/domain/notification_deep_link.dart';
import '../../../app/app_scope.dart';
import '../../../core/config/app_config.dart';
import '../../../core/widgets/lazy_indexed_stack.dart';
import '../../../core/widgets/mobile_pill_nav.dart';
import '../../../core/widgets/pwa_update_banner.dart';
import '../../../core/widgets/stripe_return_banner.dart';
import '../../../l10n/app_localizations.dart';
import '../../offers/presentation/offer_history_screen.dart'
    deferred as offer_history_screen;
import '../../settings/presentation/settings_screen.dart'
    deferred as settings_screen;
import '../../help/presentation/help_screen.dart' deferred as help_screen;
import '../../help/presentation/help_ticket_detail_screen.dart'
    deferred as help_ticket_detail_screen;

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
        pageBuilder: (context) =>
            OfferFlowScreen(user: widget.user, profile: widget.profile),
      ),
      _HomeTab(
        labelBuilder: (l10n) => l10n.historyTabLabel,
        icon: Icons.history,
        pageBuilder: (context) => DeferredWidget(
          loadLibrary: offer_history_screen.loadLibrary,
          builder: () =>
              offer_history_screen.OfferHistoryScreen(user: widget.user),
        ),
      ),
      _HomeTab(
        labelBuilder: (l10n) => l10n.settingsTabLabel,
        icon: Icons.settings,
        pageBuilder: (context) => DeferredWidget(
          loadLibrary: settings_screen.loadLibrary,
          builder: () => settings_screen.SettingsScreen(
            user: widget.user,
            profile: widget.profile,
          ),
        ),
      ),
      _HomeTab(
        labelBuilder: (l10n) => l10n.helpTabLabel,
        icon: Icons.help,
        pageBuilder: (context) => DeferredWidget(
          loadLibrary: help_screen.loadLibrary,
          builder: () => help_screen.HelpScreen(user: widget.user),
        ),
      ),
    ];

    return Stack(
      children: [
        Scaffold(
          backgroundColor: Theme.of(context).colorScheme.surface,
          resizeToAvoidBottomInset: false,
          body: LazyIndexedStack(
            index: _currentIndex,
            builders: tabs
                .map(
                  (tab) =>
                      (context) => SafeArea(child: tab.pageBuilder(context)),
                )
                .toList(),
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
        const PwaUpdateBanner(),
        const StripeReturnBanner(),
      ],
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
            builder: (context) => DeferredWidget(
              loadLibrary: help_ticket_detail_screen.loadLibrary,
              loading: const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              ),
              builder: () => help_ticket_detail_screen.HelpTicketDetailScreen(
                user: widget.user,
                ticketId: ticketId,
              ),
            ),
          ),
        )
        .then((_) {
          _isTicketDetailOpen = false;
          _openedTicketId = null;
        });
  }
}

class _HomeTab {
  final WidgetBuilder pageBuilder;
  final IconData icon;
  final String Function(AppLocalizations l10n) labelBuilder;

  _HomeTab({
    required this.pageBuilder,
    required this.icon,
    required this.labelBuilder,
  });
}
