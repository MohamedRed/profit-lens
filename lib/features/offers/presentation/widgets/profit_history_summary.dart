import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_record.dart';

class ProfitHistorySummary extends StatelessWidget {
  final List<OfferRecord> offers;

  const ProfitHistorySummary({
    super.key,
    required this.offers,
  });

  @override
  Widget build(BuildContext context) {
    if (offers.isEmpty) {
      return const SizedBox.shrink();
    }
    final l10n = AppLocalizations.of(context)!;
    final localeTag = Localizations.localeOf(context).toString();
    final averageAll = _averageProfit(offers);
    final averageLabel = CurrencyFormat.euro(averageAll, localeTag);

    final now = DateTime.now();
    final startOfToday = DateTime(now.year, now.month, now.day);
    final todayOffers =
        offers.where((offer) => !offer.createdAt.isBefore(startOfToday)).toList();
    final earlierOffers =
        offers.where((offer) => offer.createdAt.isBefore(startOfToday)).toList();

    String headline;
    if (todayOffers.isEmpty) {
      headline = l10n.historySummaryNoToday;
    } else if (earlierOffers.isEmpty) {
      headline = l10n.historySummaryNotEnoughHistory;
    } else {
      final todayAverage = _averageProfit(todayOffers);
      final earlierAverage = _averageProfit(earlierOffers);
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
        Text(
          headline,
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 4),
        Text(
          l10n.historySummaryAverageProfit(averageLabel),
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  double _averageProfit(List<OfferRecord> entries) {
    final total = entries.fold<double>(
      0,
      (sum, offer) => sum + offer.breakdown.netProfit,
    );
    return total / entries.length;
  }
}
