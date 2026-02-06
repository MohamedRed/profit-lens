import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_daily_stats.dart';
import 'profit_history_chart_canvas.dart';

class ProfitHistoryChart extends StatelessWidget {
  final List<OfferDailyStats> stats;

  const ProfitHistoryChart({
    super.key,
    required this.stats,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (stats.length < 2) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Text(l10n.historyChartEmptyMessage),
      );
    }
    final sorted = [...stats]..sort(
        (a, b) => a.dayStart.compareTo(b.dayStart),
      );
    final values = sorted.map((stat) => stat.averageProfit).toList();
    final minValue = values.reduce((a, b) => a < b ? a : b);
    final maxValue = values.reduce((a, b) => a > b ? a : b);
    final maxAbs =
        math.max(minValue.abs(), maxValue.abs()).toDouble();
    final normalizedMax = maxAbs == 0 ? 1.0 : maxAbs;
    final normalizedMin = -normalizedMax;
    final localeTag = Localizations.localeOf(context).toString();
    final latest = CurrencyFormat.euro(values.last, localeTag);
    final thresholdLabel = CurrencyFormat.euro(0, localeTag);
    final axisTicks = [
      ChartAxisTick(
        value: normalizedMax,
        label: CurrencyFormat.euro(normalizedMax, localeTag),
      ),
      ChartAxisTick(
        value: normalizedMax / 2,
        label: CurrencyFormat.euro(normalizedMax / 2, localeTag),
      ),
      ChartAxisTick(
        value: 0,
        label: thresholdLabel,
      ),
      ChartAxisTick(
        value: normalizedMin / 2,
        label: CurrencyFormat.euro(normalizedMin / 2, localeTag),
      ),
      ChartAxisTick(
        value: normalizedMin,
        label: CurrencyFormat.euro(normalizedMin, localeTag),
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          l10n.historyChartTitle,
          style: Theme.of(context).textTheme.titleMedium,
        ),
        const SizedBox(height: 8),
        Text(
          '${l10n.latestProfitLabel}: $latest',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 12),
        ProfitHistoryChartCanvas(
          values: values,
          minValue: normalizedMin,
          maxValue: normalizedMax,
          thresholdLabel: thresholdLabel,
          axisTicks: axisTicks,
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 16,
          children: [
            _LegendItem(
              color: Theme.of(context).colorScheme.primary,
              label: l10n.historyChartProfitLabel,
            ),
            _LegendItem(
              color: Theme.of(context).colorScheme.outline,
              label: l10n.profitThresholdLabel,
            ),
          ],
        ),
      ],
    );
  }
}

class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendItem({
    required this.color,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 6),
        Text(label),
      ],
    );
  }
}
