import '../../offers/domain/offer_daily_stats.dart';

abstract class OfferStatsRepository {
  Stream<List<OfferDailyStats>> watchDailyStats(String uid, {int limit = 90});
}
