import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../data/offer_repository.dart';
import '../data/offer_stats_repository.dart';
import '../domain/offer_daily_stats.dart';
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
  static const _pageSize = 30;
  static const _loadMoreThreshold = 240.0;

  late OfferRepository _offerRepository;
  late OfferStatsRepository _offerStatsRepository;
  Stream<List<OfferDailyStats>>? _statsStream;
  List<OfferRecord> _offers = [];
  bool _isLoadingInitial = true;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  OfferPage? _lastPage;
  bool _hasLoadMoreError = false;
  bool _initialized = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_handleScroll);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;
    final services = AppScope.of(context);
    _offerRepository = services.offerRepository;
    _offerStatsRepository = services.offerStatsRepository;
    _statsStream = _offerStatsRepository.watchDailyStats(
      widget.user.uid,
      limit: 90,
    );
    _loadInitial();
    _initialized = true;
  }

  @override
  void dispose() {
    _scrollController.removeListener(_handleScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _handleScroll() {
    if (_viewMode != HistoryViewMode.list) return;
    if (!_scrollController.hasClients) return;
    if (_isLoadingMore || !_hasMore || _hasLoadMoreError) return;
    final position = _scrollController.position;
    if (position.maxScrollExtent == 0) return;
    final remaining = position.maxScrollExtent - position.pixels;
    if (remaining <= _loadMoreThreshold) {
      _loadMore();
    }
  }

  Future<void> _loadInitial() async {
    setState(() {
      _isLoadingInitial = true;
    });
    final page = await _offerRepository.fetchOffersPage(
      widget.user.uid,
      limit: _pageSize,
    );
    if (!mounted) return;
    setState(() {
      _offers = page.offers;
      _lastPage = page;
      _hasMore = page.hasMore;
      _isLoadingInitial = false;
    });
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_hasMore) return;
    setState(() {
      _isLoadingMore = true;
      _hasLoadMoreError = false;
    });
    try {
      final page = await _offerRepository.fetchOffersPage(
        widget.user.uid,
        startAfter: _lastPage?.lastDocument,
        limit: _pageSize,
      );
      if (!mounted) return;
      final sameCursor =
          page.lastDocument != null &&
          _lastPage?.lastDocument?.id == page.lastDocument?.id;
      final noProgress = page.offers.isEmpty || sameCursor;
      setState(() {
        if (!noProgress) {
          _offers = [..._offers, ...page.offers];
          _lastPage = page;
        }
        _hasMore = page.hasMore && !noProgress;
        _isLoadingMore = false;
        _hasLoadMoreError = noProgress;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isLoadingMore = false;
        _hasMore = false;
        _hasLoadMoreError = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    if (_isLoadingInitial) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.historyTabLabel)),
        body: const SafeArea(
          child: Center(child: CircularProgressIndicator()),
        ),
      );
    }
    if (_offers.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: Text(l10n.historyTabLabel)),
        body: SafeArea(child: Center(child: Text(l10n.noHistoryMessage))),
      );
    }
    return StreamBuilder<List<OfferDailyStats>>(
      stream: _statsStream,
      builder: (context, snapshot) {
        final stats = snapshot.data ?? [];
        return Scaffold(
          appBar: AppBar(title: Text(l10n.historyTabLabel)),
          body: SafeArea(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 12),
                  child: Center(
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
                        if (_viewMode == HistoryViewMode.list) {
                          _handleScroll();
                        }
                      },
                    ),
                  ),
                ),
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 250),
                    child: _viewMode == HistoryViewMode.list
                        ? OfferHistoryList(
                            controller: _scrollController,
                            offers: _offers,
                            onSelected: (offer) {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (context) =>
                                      OfferHistoryDetailScreen(record: offer),
                                ),
                              );
                            },
                            hasMore: _hasMore,
                            isLoadingMore: _isLoadingMore,
                            hasError: _hasLoadMoreError,
                          )
                        : OfferHistoryCharts(stats: stats),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
