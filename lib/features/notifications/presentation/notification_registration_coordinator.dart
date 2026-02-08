import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';

import '../../../core/config/app_config.dart';
import '../../../core/device/device_id_service.dart';
import '../../auth/domain/auth_user.dart';
import '../data/notification_token_repository.dart';

class NotificationRegistrationCoordinator {
  final FirebaseMessaging _messaging;
  final NotificationTokenRepository _repository;
  final DeviceIdService _deviceIdService;
  StreamSubscription<String>? _tokenSubscription;
  StreamSubscription<RemoteMessage>? _messageSubscription;

  NotificationRegistrationCoordinator({
    FirebaseMessaging? messaging,
    required NotificationTokenRepository repository,
    required DeviceIdService deviceIdService,
  }) : _messaging = messaging ?? FirebaseMessaging.instance,
       _repository = repository,
       _deviceIdService = deviceIdService;

  Future<void> start({
    required AuthUser user,
    ValueChanged<RemoteMessage>? onForegroundMessage,
  }) async {
    if (kIsWeb && AppConfig.fcmVapidKey.isEmpty) {
      return;
    }
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      announcement: false,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
    );
    final authorized =
        settings.authorizationStatus == AuthorizationStatus.authorized ||
        settings.authorizationStatus == AuthorizationStatus.provisional;
    if (!authorized) {
      return;
    }
    final token = await _messaging.getToken(
      vapidKey: AppConfig.fcmVapidKey.isEmpty ? null : AppConfig.fcmVapidKey,
    );
    if (token != null) {
      await _repository.upsertToken(
        uid: user.uid,
        token: token,
        platform: _resolvePlatform(),
        deviceId: await _deviceIdService.getDeviceId(),
      );
    }
    _tokenSubscription?.cancel();
    _tokenSubscription = _messaging.onTokenRefresh.listen((newToken) async {
      await _repository.upsertToken(
        uid: user.uid,
        token: newToken,
        platform: _resolvePlatform(),
        deviceId: await _deviceIdService.getDeviceId(),
      );
    });
    if (onForegroundMessage != null) {
      _messageSubscription?.cancel();
      _messageSubscription = FirebaseMessaging.onMessage.listen(
        onForegroundMessage,
      );
    }
  }

  Future<void> dispose() async {
    await _tokenSubscription?.cancel();
    await _messageSubscription?.cancel();
  }

  String _resolvePlatform() {
    if (kIsWeb) return 'web';
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return 'android';
      case TargetPlatform.iOS:
        return 'ios';
      case TargetPlatform.macOS:
        return 'macos';
      case TargetPlatform.windows:
        return 'windows';
      case TargetPlatform.linux:
        return 'linux';
      case TargetPlatform.fuchsia:
        return 'fuchsia';
    }
  }
}
