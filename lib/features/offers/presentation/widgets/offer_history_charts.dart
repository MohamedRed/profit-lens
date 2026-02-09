import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_daily_stats.dart';
import 'profit_history_chart.dart';
import 'profit_history_summary.dart';

class OfferHistoryCharts extends StatelessWidget {
  final List<OfferDailyStats> stats;

  const OfferHistoryCharts({super.key, required this.stats});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ListView(
      key: const ValueKey('history_charts'),
      padding: const EdgeInsets.all(16),
      children: [
        ProfitHistoryChart(stats: stats),
        const SizedBox(height: 12),
        ProfitHistorySummary(stats: stats),
        const SizedBox(height: 12),
        Text(
          l10n.historyChartHintMessage,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}
