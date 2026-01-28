import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_record.dart';
import '../offer_flow_keys.dart';

class ProfitabilityOverviewCard extends StatelessWidget {
  final OfferRecord record;
  final VoidCallback onViewDetails;

  const ProfitabilityOverviewCard({
    super.key,
    required this.record,
    required this.onViewDetails,
  });

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
              l10n.profitabilityOverviewTitle,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            Text(
              CurrencyFormat.euro(record.breakdown.netProfit, localeTag),
              style: Theme.of(context)
                  .textTheme
                  .headlineMedium
                  ?.copyWith(color: netColor),
            ),
            const SizedBox(height: 4),
            Text(l10n.netProfitLabel),
            const SizedBox(height: 12),
            _row(
              l10n.grossRevenueLabel,
              CurrencyFormat.euro(record.offer.payoutEuro, localeTag),
            ),
            _row(
              l10n.totalCostsLabel,
              CurrencyFormat.euro(record.breakdown.totalCosts, localeTag),
            ),
            const SizedBox(height: 12),
            PrimaryButton(
              key: OfferFlowKeys.viewDetailsButton,
              label: l10n.viewProfitabilityDetailsButton,
              onPressed: onViewDetails,
            ),
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
