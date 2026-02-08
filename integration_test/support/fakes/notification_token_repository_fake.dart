import 'package:profit_lens/features/notifications/data/notification_token_repository.dart';

class InMemoryNotificationTokenRepository
    implements NotificationTokenRepository {
  @override
  Future<void> deleteToken({
    required String uid,
    required String token,
  }) async {}

  @override
  Future<void> upsertToken({
    required String uid,
    required String token,
    required String platform,
    required String deviceId,
  }) async {}
}
