import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_record.dart';

class OfferBreakdownCard extends StatelessWidget {
  final OfferRecord record;

  const OfferBreakdownCard({super.key, required this.record});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeTag = Localizations.localeOf(context).toString();
    final netColor = record.breakdown.netProfit >= 0
        ? Theme.of(context).colorScheme.primary
        : Theme.of(context).colorScheme.error;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              CurrencyFormat.euro(record.breakdown.netProfit, localeTag),
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(color: netColor),
            ),
            const SizedBox(height: 4),
            Text(l10n.netProfitLabel),
            const SizedBox(height: 16),
            _row(l10n.grossRevenueLabel,
                CurrencyFormat.euro(record.offer.payoutEuro, localeTag)),
            if (record.offer.routeVerification != null) ...[
              _row(
                l10n.verifiedDistanceLabel,
                record.offer.routeVerification!.distanceKm
                    .toStringAsFixed(1),
              ),
              _row(
                l10n.verifiedDurationLabel,
                record.offer.routeVerification!.durationMinutes
                    .toStringAsFixed(0),
              ),
            ],
            _row(l10n.energyCostLabel,
                CurrencyFormat.euro(record.breakdown.energyCost, localeTag)),
            _row(
                l10n.maintenanceCostLabel,
                CurrencyFormat.euro(
                    record.breakdown.maintenanceCost, localeTag)),
            _row(
                l10n.depreciationCostLabel,
                CurrencyFormat.euro(
                    record.breakdown.depreciationCost, localeTag)),
            _row(
                l10n.socialContributionLabel,
                CurrencyFormat.euro(
                    record.breakdown.socialContributions, localeTag)),
            _row(l10n.incomeTaxLabel,
                CurrencyFormat.euro(record.breakdown.incomeTax, localeTag)),
            _row(
                l10n.fixedCostsLabel,
                CurrencyFormat.euro(
                    record.breakdown.fixedCostAllocation, localeTag)),
            const Divider(height: 24),
            _row(l10n.totalCostsLabel,
                CurrencyFormat.euro(record.breakdown.totalCosts, localeTag)),
          ],
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
