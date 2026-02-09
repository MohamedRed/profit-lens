import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_daily_stats.dart';

class ProfitHistorySummary extends StatelessWidget {
  final List<OfferDailyStats> stats;

  const ProfitHistorySummary({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    if (stats.isEmpty) {
      return const SizedBox.shrink();
    }
    final l10n = AppLocalizations.of(context)!;
    final localeTag = Localizations.localeOf(context).toString();
    final totalCount = stats.fold<int>(0, (sum, stat) => sum + stat.count);
    if (totalCount == 0) {
      return const SizedBox.shrink();
    }
    final totalSum = stats.fold<double>(
      0,
      (sum, stat) => sum + stat.netProfitSum,
    );
    final averageAll = totalSum / totalCount;
    final averageLabel = CurrencyFormat.euro(averageAll, localeTag);

    final now = DateTime.now();
    final startOfToday = DateTime(now.year, now.month, now.day);
    final todayStats = stats
        .where((stat) => !_isBeforeLocalDay(stat.dayStart, startOfToday))
        .toList();
    final earlierStats = stats
        .where((stat) => _isBeforeLocalDay(stat.dayStart, startOfToday))
        .toList();

    String headline;
    if (todayStats.isEmpty) {
      headline = l10n.historySummaryNoToday;
    } else if (earlierStats.isEmpty) {
      headline = l10n.historySummaryNotEnoughHistory;
    } else {
      final todayAverage = _averageProfit(todayStats);
      final earlierAverage = _averageProfit(earlierStats);
      final delta = todayAverage - earlierAverage;
      if (delta.abs() < 0.01) {
        headline = l10n.historySummaryTodayEqual;
      } else {
        final diffLabel = CurrencyFormat.euro(delta.abs(), localeTag);
        headline = delta > 0
            ? l10n.historySummaryTodayMore(diffLabel)
            : l10n.historySummaryTodayLess(diffLabel);
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(headline, style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 4),
        Text(
          l10n.historySummaryAverageProfit(averageLabel),
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  double _averageProfit(List<OfferDailyStats> entries) {
    final totalCount = entries.fold<int>(0, (sum, stat) => sum + stat.count);
    if (totalCount == 0) {
      return 0;
    }
    final totalSum = entries.fold<double>(
      0,
      (sum, stat) => sum + stat.netProfitSum,
    );
    return totalSum / totalCount;
  }

  bool _isBeforeLocalDay(DateTime dayStartUtc, DateTime localDayStart) {
    final localDay = dayStartUtc.toLocal();
    final normalized = DateTime(localDay.year, localDay.month, localDay.day);
    return normalized.isBefore(localDayStart);
  }
}
