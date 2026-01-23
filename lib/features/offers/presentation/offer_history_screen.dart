import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/utils/currency_format.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/offer_record.dart';
import 'offer_history_detail_screen.dart';

class OfferHistoryScreen extends StatelessWidget {
  final AuthUser user;

  const OfferHistoryScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);
    final l10n = AppLocalizations.of(context)!;
    final localeTag = Localizations.localeOf(context).toString();

    return StreamBuilder<List<OfferRecord>>(
      stream: services.offerRepository.watchOffers(user.uid),
      builder: (context, snapshot) {
        final offers = snapshot.data ?? [];
        return Scaffold(
          appBar: AppBar(title: Text(l10n.historyTabLabel)),
          body: offers.isEmpty
              ? Center(child: Text(l10n.noHistoryMessage))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemBuilder: (context, index) {
                    final offer = offers[index];
                    return ListTile(
                      title: Text(
                        CurrencyFormat.euro(
                          offer.breakdown.netProfit,
                          localeTag,
                        ),
                      ),
                      subtitle: Text(
                        '${offer.offer.distanceKm.toStringAsFixed(1)} km • ${offer.createdAt.toLocal().toString().split(' ').first}',
                      ),
                      trailing: Text(
                        CurrencyFormat.euro(
                          offer.offer.payoutEuro,
                          localeTag,
                        ),
                      ),
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => OfferHistoryDetailScreen(
                              record: offer,
                            ),
                          ),
                        );
                      },
                    );
                  },
                  separatorBuilder: (context, index) => const Divider(),
                  itemCount: offers.length,
                ),
        );
      },
    );
  }
}
