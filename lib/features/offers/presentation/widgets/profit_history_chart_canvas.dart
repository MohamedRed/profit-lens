import 'package:flutter/material.dart';

class ChartAxisTick {
  final double value;
  final String label;

  const ChartAxisTick({required this.value, required this.label});
}

class ProfitHistoryChartCanvas extends StatelessWidget {
  final List<double> values;
  final double minValue;
  final double maxValue;
  final String thresholdLabel;
  final List<ChartAxisTick> axisTicks;

  const ProfitHistoryChartCanvas({
    super.key,
    required this.values,
    required this.minValue,
    required this.maxValue,
    required this.thresholdLabel,
    required this.axisTicks,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 220,
      width: double.infinity,
      child: LayoutBuilder(
        builder: (context, constraints) {
          const padding = 16.0;
          const labelWidth = 44.0;
          final chartHeight = constraints.maxHeight - padding * 2;
          final range = maxValue - minValue;
          final thresholdRatio = (0 - minValue) / (range == 0 ? 1 : range);
          final thresholdY =
              padding + chartHeight - (thresholdRatio * chartHeight);
          final badgeTop = thresholdY.clamp(8.0, constraints.maxHeight - 28.0);
          final labelStyle = Theme.of(context).textTheme.labelSmall?.copyWith(
            color: Theme.of(context).colorScheme.onSurfaceVariant,
          );
          final tickPositions = axisTicks
              .map(
                (tick) => _AxisTickPosition(
                  label: tick.label,
                  top:
                      padding +
                      chartHeight -
                      (((tick.value - minValue) / (range == 0 ? 1 : range)) *
                          chartHeight) -
                      8,
                ),
              )
              .toList();
          return Row(
            children: [
              SizedBox(
                width: labelWidth,
                height: constraints.maxHeight,
                child: Stack(
                  children: [
                    for (final tick in tickPositions)
                      Positioned(
                        right: 8,
                        top: tick.top.clamp(2.0, constraints.maxHeight - 16.0),
                        child: Text(
                          tick.label,
                          style: labelStyle,
                          textAlign: TextAlign.right,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: CustomPaint(
                        painter: _ProfitHistoryChartPainter(
                          values: values,
                          minValue: minValue,
                          maxValue: maxValue,
                          lineColor: Theme.of(context).colorScheme.primary,
                          thresholdColor: Theme.of(context).colorScheme.error,
                          axisColor: Theme.of(context).dividerColor,
                          gridColor: Theme.of(
                            context,
                          ).colorScheme.outlineVariant,
                          backgroundColor: Theme.of(context)
                              .colorScheme
                              .surfaceContainerHighest
                              .withValues(alpha: 0.4),
                        ),
                      ),
                    ),
                    Positioned(
                      top: badgeTop,
                      right: padding,
                      child: _ThresholdBadge(
                        label: thresholdLabel,
                        color: Theme.of(context).colorScheme.error,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _AxisTickPosition {
  final String label;
  final double top;

  const _AxisTickPosition({required this.label, required this.top});
}

class _ThresholdBadge extends StatelessWidget {
  final String label;
  final Color color;

  const _ThresholdBadge({required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        child: Text(
          label,
          style: Theme.of(context).textTheme.labelSmall?.copyWith(color: color),
        ),
      ),
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
      ..strokeWidth = 2.5;
    final thresholdY =
        chartRect.bottom -
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
      final y =
          chartRect.bottom -
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
