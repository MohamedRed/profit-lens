import 'package:cloud_firestore/cloud_firestore.dart';

import '../../domain/offer_daily_stats.dart';

class OfferDailyStatsMapper {
  OfferDailyStats? fromDocument(Map<String, dynamic>? data) {
    if (data == null) return null;
    final dayStart = (data['dayStart'] as Timestamp?)?.toDate();
    final count = (data['count'] as num?)?.toInt();
    final netProfitSum = (data['netProfitSum'] as num?)?.toDouble();
    if (dayStart == null || count == null || netProfitSum == null) {
      return null;
    }
    return OfferDailyStats(
      dayStart: dayStart,
      count: count,
      netProfitSum: netProfitSum,
    );
  }
}
