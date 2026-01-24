import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/offer_record.dart';
import 'offer_history_detail_screen.dart';
import 'widgets/offer_history_charts.dart';
import 'widgets/offer_history_list.dart';

enum HistoryViewMode { list, charts }

class OfferHistoryScreen extends StatefulWidget {
  final AuthUser user;

  const OfferHistoryScreen({super.key, required this.user});

  @override
  State<OfferHistoryScreen> createState() => _OfferHistoryScreenState();
}

class _OfferHistoryScreenState extends State<OfferHistoryScreen> {
  HistoryViewMode _viewMode = HistoryViewMode.list;

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);
    final l10n = AppLocalizations.of(context)!;

    return StreamBuilder<List<OfferRecord>>(
      stream: services.offerRepository.watchOffers(widget.user.uid),
      builder: (context, snapshot) {
        final offers = snapshot.data ?? [];
        return Scaffold(
          appBar: AppBar(title: Text(l10n.historyTabLabel)),
          body: offers.isEmpty
              ? Center(child: Text(l10n.noHistoryMessage))
              : Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: SegmentedButton<HistoryViewMode>(
                        segments: [
                          ButtonSegment(
                            value: HistoryViewMode.list,
                            label: Text(l10n.historyViewListLabel),
                            icon: const Icon(Icons.list),
                          ),
                          ButtonSegment(
                            value: HistoryViewMode.charts,
                            label: Text(l10n.historyViewChartsLabel),
                            icon: const Icon(Icons.show_chart),
                          ),
                        ],
                        selected: {_viewMode},
                        onSelectionChanged: (selection) {
                          setState(() => _viewMode = selection.first);
                        },
                      ),
                    ),
                    Expanded(
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        child: _viewMode == HistoryViewMode.list
                            ? OfferHistoryList(
                                offers: offers,
                                onSelected: (offer) {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          OfferHistoryDetailScreen(
                                        record: offer,
                                      ),
                                    ),
                                  );
                                },
                              )
                            : OfferHistoryCharts(offers: offers),
                      ),
                    ),
                  ],
                ),
        );
      },
    );
  }
}
