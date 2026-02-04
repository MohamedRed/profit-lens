import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../core/utils/date_time_format.dart';
import '../../domain/offer_record.dart';

class OfferHistoryList extends StatelessWidget {
  final List<OfferRecord> offers;
  final ValueChanged<OfferRecord> onSelected;

  const OfferHistoryList({
    super.key,
    required this.offers,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final localeTag = Localizations.localeOf(context).toString();
    return ListView.separated(
      key: const ValueKey('history_list'),
      padding: const EdgeInsets.all(24),
      itemBuilder: (context, index) {
        final offer = offers[index];
        final profit = CurrencyFormat.euro(offer.breakdown.netProfit, localeTag);
        final payout = CurrencyFormat.euro(offer.offer.payoutEuro, localeTag);
        final distanceKm = offer.offer.routeVerification?.distanceKm ??
            offer.offer.distanceKm;
        final subtitle =
            '${distanceKm.toStringAsFixed(1)} km • ${formatShortDateTime(context, offer.createdAt)}';

        return InkWell(
          onTap: () => onSelected(offer),
          borderRadius: BorderRadius.circular(24),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        profit,
                        style: Theme.of(context)
                            .textTheme
                            .titleMedium
                            ?.copyWith(fontSize: 20),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      payout,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.secondary,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                    const SizedBox(height: 4),
                    const Icon(Icons.chevron_right, color: Color(0xFFA1A1AA)),
                  ],
                ),
              ],
            ),
          ),
        );
      },
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemCount: offers.length,
    );
  }
}
