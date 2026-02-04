import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_record.dart';

class ProfitHistoryChart extends StatelessWidget {
  final List<OfferRecord> offers;

  const ProfitHistoryChart({
    super.key,
    required this.offers,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (offers.length < 2) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Text(l10n.historyChartEmptyMessage),
      );
    }
    final sorted = [...offers]..sort(
        (a, b) => a.createdAt.compareTo(b.createdAt),
      );
    final values = sorted.map((offer) => offer.breakdown.netProfit).toList();
    final minValue = values.reduce((a, b) => a < b ? a : b);
    final maxValue = values.reduce((a, b) => a > b ? a : b);
    final maxAbs =
        math.max(minValue.abs(), maxValue.abs()).toDouble();
    final normalizedMax = maxAbs == 0 ? 1.0 : maxAbs;
    final normalizedMin = -normalizedMax;
    final localeTag = Localizations.localeOf(context).toString();
    final latest = CurrencyFormat.euro(values.last, localeTag);

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
        SizedBox(
          height: 220,
          width: double.infinity,
          child: CustomPaint(
            painter: _ProfitHistoryChartPainter(
              values: values,
              minValue: normalizedMin,
              maxValue: normalizedMax,
              lineColor: Theme.of(context).colorScheme.primary,
              thresholdColor: Theme.of(context).colorScheme.outline,
              axisColor: Theme.of(context).dividerColor,
              gridColor: Theme.of(context).colorScheme.outlineVariant,
              backgroundColor: Theme.of(context)
                  .colorScheme
                  .surfaceContainerHighest
                  .withValues(alpha: 0.4),
            ),
          ),
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

class _ProfitHistoryChartPainter extends CustomPainter {
  final List<double> values;
  final double minValue;
  final double maxValue;
  final double threshold;
  final Color lineColor;
  final Color thresholdColor;
  final Color axisColor;
  final Color gridColor;
  final Color backgroundColor;

  _ProfitHistoryChartPainter({
    required this.values,
    required this.minValue,
    required this.maxValue,
    this.threshold = 0,
    required this.lineColor,
    required this.thresholdColor,
    required this.axisColor,
    required this.gridColor,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (values.isEmpty) return;
    const padding = 16.0;
    final chartRect = Rect.fromLTWH(
      padding,
      padding,
      size.width - padding * 2,
      size.height - padding * 2,
    );
    if (chartRect.width <= 0 || chartRect.height <= 0) {
      return;
    }

    final normalizedMax = maxValue == minValue ? maxValue + 1 : maxValue;
    final normalizedMin = maxValue == minValue ? minValue - 1 : minValue;
    final range = normalizedMax - normalizedMin;

    final backgroundPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.fill;
    final chartRRect = RRect.fromRectAndRadius(
      chartRect,
      const Radius.circular(12),
    );
    canvas.drawRRect(chartRRect, backgroundPaint);

    final gridPaint = Paint()
      ..color = gridColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    for (var i = 1; i <= 3; i++) {
      final y = chartRect.top + (chartRect.height / 4) * i;
      canvas.drawLine(
        Offset(chartRect.left, y),
        Offset(chartRect.right, y),
        gridPaint,
      );
    }

    final axisPaint = Paint()
      ..color = axisColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawRRect(chartRRect, axisPaint);

    final thresholdPaint = Paint()
      ..color = thresholdColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    final thresholdY = chartRect.bottom -
        ((threshold - normalizedMin) / range) * chartRect.height;
    canvas.drawLine(
      Offset(chartRect.left, thresholdY),
      Offset(chartRect.right, thresholdY),
      thresholdPaint,
    );

    final linePaint = Paint()
      ..color = lineColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final pointPaint = Paint()
      ..color = lineColor
      ..style = PaintingStyle.fill;

    final path = Path();
    canvas.save();
    canvas.clipRRect(chartRRect);
    for (var i = 0; i < values.length; i++) {
      final xRatio = values.length == 1 ? 0.5 : i / (values.length - 1);
      final x = chartRect.left + chartRect.width * xRatio;
      final y = chartRect.bottom -
          ((values[i] - normalizedMin) / range) * chartRect.height;
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
      canvas.drawCircle(Offset(x, y), 4, pointPaint);
    }
    canvas.drawPath(path, linePaint);
    canvas.restore();
  }

  @override
  bool shouldRepaint(covariant _ProfitHistoryChartPainter oldDelegate) {
    return oldDelegate.values != values ||
        oldDelegate.minValue != minValue ||
        oldDelegate.maxValue != maxValue ||
        oldDelegate.threshold != threshold ||
        oldDelegate.lineColor != lineColor ||
        oldDelegate.thresholdColor != thresholdColor ||
        oldDelegate.axisColor != axisColor ||
        oldDelegate.gridColor != gridColor ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}
