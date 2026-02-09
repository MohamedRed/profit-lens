import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_record.dart';
import '../offer_flow_keys.dart';

class ProfitabilityOverviewCard extends StatelessWidget {
  final OfferRecord record;
  final double minProfitabilityEuro;
  final VoidCallback onViewDetails;

  const ProfitabilityOverviewCard({
    super.key,
    required this.record,
    required this.minProfitabilityEuro,
    required this.onViewDetails,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeTag = Localizations.localeOf(context).toString();
    final netProfit = record.breakdown.netProfit;
    final netColor = netProfit >= 0
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
            const SizedBox(height: 16),
            Text(
              CurrencyFormat.euro(netProfit, localeTag),
              style: Theme.of(
                context,
              ).textTheme.headlineMedium?.copyWith(color: netColor),
            ),
            const SizedBox(height: 4),
            Text(l10n.netProfitLabel),
            const SizedBox(height: 12),
            _row(
              l10n.grossRevenueLabel,
              CurrencyFormat.euro(record.offer.payoutEuro, localeTag),
            ),
            if (record.offer.routeVerification != null) ...[
              _row(
                l10n.verifiedDistanceLabel,
                '${record.offer.routeVerification!.distanceKm.toStringAsFixed(1)} ${l10n.distanceUnitKm}',
              ),
              _row(
                l10n.verifiedDurationLabel,
                '${record.offer.routeVerification!.durationMinutes.toStringAsFixed(0)} ${l10n.durationUnitMinutes}',
              ),
            ],
            _row(
              l10n.totalCostsLabel,
              CurrencyFormat.euro(record.breakdown.totalCosts, localeTag),
            ),
            _row(
              l10n.minProfitabilityLabel,
              CurrencyFormat.euro(minProfitabilityEuro, localeTag),
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
        children: [Text(label), Text(value)],
      ),
    );
  }
}

class ProfitabilityDecisionCard extends StatelessWidget {
  final OfferRecord record;
  final double minProfitabilityEuro;

  const ProfitabilityDecisionCard({
    super.key,
    required this.record,
    required this.minProfitabilityEuro,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeTag = Localizations.localeOf(context).toString();
    final targetDelta = record.breakdown.netProfit - minProfitabilityEuro;
    final isAccept = targetDelta >= 0;
    final decisionColor = isAccept
        ? Colors.green.shade600
        : Theme.of(context).colorScheme.error;
    final decisionBackground = isAccept
        ? Colors.green.shade600.withOpacity(0.12)
        : Theme.of(context).colorScheme.error.withOpacity(0.12);
    final decisionLabel = isAccept
        ? l10n.offerDecisionAccept
        : l10n.offerDecisionDecline;
    final decisionDetail = isAccept
        ? l10n.offerDecisionAbove(
            CurrencyFormat.euro(targetDelta.abs(), localeTag),
          )
        : l10n.offerDecisionBelow(
            CurrencyFormat.euro(targetDelta.abs(), localeTag),
          );
    final minLabel = l10n.minProfitabilityLabel;
    final minValue = CurrencyFormat.euro(minProfitabilityEuro, localeTag);

    return _DecisionSection(
      label: decisionLabel,
      detail: decisionDetail,
      minLabel: minLabel,
      minValue: minValue,
      textColor: decisionColor,
      backgroundColor: decisionBackground,
    );
  }
}

class _DecisionSection extends StatelessWidget {
  final String label;
  final String detail;
  final String minLabel;
  final String minValue;
  final Color textColor;
  final Color backgroundColor;

  const _DecisionSection({
    required this.label,
    required this.detail,
    required this.minLabel,
    required this.minValue,
    required this.textColor,
    required this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final titleStyle = Theme.of(context).textTheme.titleLarge?.copyWith(
      color: textColor,
      fontWeight: FontWeight.w700,
    );
    final detailStyle = Theme.of(context).textTheme.bodySmall?.copyWith(
      color: textColor,
      fontWeight: FontWeight.w600,
    );
    final pillTextStyle = Theme.of(context).textTheme.labelSmall?.copyWith(
      color: textColor,
      fontWeight: FontWeight.w600,
    );
    final pillBackground = textColor.withOpacity(0.12);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: titleStyle),
          const SizedBox(height: 6),
          Text(detail, style: detailStyle),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              _DecisionPill(
                label: minLabel,
                value: minValue,
                backgroundColor: pillBackground,
                textStyle: pillTextStyle,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DecisionPill extends StatelessWidget {
  final String label;
  final String value;
  final Color backgroundColor;
  final TextStyle? textStyle;

  const _DecisionPill({
    required this.label,
    required this.value,
    required this.backgroundColor,
    required this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text('$label: $value', style: textStyle),
    );
  }
}
