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
      padding: const EdgeInsets.all(16),
      itemBuilder: (context, index) {
        final offer = offers[index];
        return ListTile(
          title: Text(
            CurrencyFormat.euro(offer.breakdown.netProfit, localeTag),
          ),
          subtitle: Text(
            '${offer.offer.distanceKm.toStringAsFixed(1)} km • ${formatShortDateTime(context, offer.createdAt)}',
          ),
          trailing: Text(
            CurrencyFormat.euro(offer.offer.payoutEuro, localeTag),
          ),
          onTap: () => onSelected(offer),
        );
      },
      separatorBuilder: (context, index) => const Divider(),
      itemCount: offers.length,
    );
  }
}
