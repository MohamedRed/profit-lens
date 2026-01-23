import 'package:flutter/material.dart';

import '../../../core/utils/currency_format.dart';
import '../../../features/offers/domain/offer.dart';
import '../../../features/profitability/domain/cost_breakdown.dart';
import '../../../l10n/app_localizations.dart';

class OfferResultScreen extends StatelessWidget {
  final Offer offer;
  final CostBreakdown breakdown;

  const OfferResultScreen({
    super.key,
    required this.offer,
    required this.breakdown,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeTag = Localizations.localeOf(context).toString();
    final netColor = breakdown.netProfit >= 0
        ? Theme.of(context).colorScheme.primary
        : Theme.of(context).colorScheme.error;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.resultTitle)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  CurrencyFormat.euro(breakdown.netProfit, localeTag),
                  style: Theme.of(context)
                      .textTheme
                      .headlineMedium
                      ?.copyWith(color: netColor),
                ),
                const SizedBox(height: 4),
                Text(l10n.netProfitLabel),
                const SizedBox(height: 16),
                _row(l10n.grossRevenueLabel,
                    CurrencyFormat.euro(offer.payoutEuro, localeTag)),
                _row(l10n.energyCostLabel,
                    CurrencyFormat.euro(breakdown.energyCost, localeTag)),
                _row(l10n.maintenanceCostLabel,
                    CurrencyFormat.euro(breakdown.maintenanceCost, localeTag)),
                _row(l10n.depreciationCostLabel,
                    CurrencyFormat.euro(breakdown.depreciationCost, localeTag)),
                _row(l10n.socialContributionLabel,
                    CurrencyFormat.euro(breakdown.socialContributions, localeTag)),
                const Divider(height: 24),
                _row(l10n.totalCostsLabel,
                    CurrencyFormat.euro(breakdown.totalCosts, localeTag)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _row(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value),
        ],
      ),
    );
  }
}
