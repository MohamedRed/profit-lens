import 'dart:async';

import 'package:profit_lens/features/offers/data/offer_stats_repository.dart';
import 'package:profit_lens/features/offers/domain/offer_daily_stats.dart';

class InMemoryOfferStatsRepository implements OfferStatsRepository {
  InMemoryOfferStatsRepository({List<OfferDailyStats>? initialStats})
    : _stats = List<OfferDailyStats>.from(initialStats ?? const []);

  final List<OfferDailyStats> _stats;
  final StreamController<List<OfferDailyStats>> _controller =
      StreamController<List<OfferDailyStats>>.broadcast();

  void setStats(List<OfferDailyStats> stats) {
    _stats
      ..clear()
      ..addAll(stats);
    _controller.add(List<OfferDailyStats>.unmodifiable(_stats));
  }

  @override
  Stream<List<OfferDailyStats>> watchDailyStats(
    String uid, {
    int limit = 90,
  }) async* {
    yield _stats.take(limit).toList(growable: false);
    yield* _controller.stream;
  }
}
