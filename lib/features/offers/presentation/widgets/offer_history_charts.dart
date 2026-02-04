import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_record.dart';
import 'profit_history_chart.dart';

class OfferHistoryCharts extends StatelessWidget {
  final List<OfferRecord> offers;

  const OfferHistoryCharts({
    super.key,
    required this.offers,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return ListView(
      key: const ValueKey('history_charts'),
      padding: const EdgeInsets.all(16),
      children: [
        ProfitHistoryChart(
          offers: offers,
        ),
        const SizedBox(height: 8),
        Text(
          l10n.historyChartHintMessage,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}
