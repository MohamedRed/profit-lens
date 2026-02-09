import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationDeepLink {
  final String ticketId;

  const NotificationDeepLink({required this.ticketId});
}

NotificationDeepLink? notificationDeepLinkFromMessage(RemoteMessage message) {
  final raw = message.data['ticketId'];
  if (raw is String && raw.isNotEmpty) {
    return NotificationDeepLink(ticketId: raw);
  }
  return null;
}
