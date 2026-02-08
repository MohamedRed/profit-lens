abstract class NotificationTokenRepository {
  Future<void> upsertToken({
    required String uid,
    required String token,
    required String platform,
    required String deviceId,
  });

  Future<void> deleteToken({required String uid, required String token});
}
