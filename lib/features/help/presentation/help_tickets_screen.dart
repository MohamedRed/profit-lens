import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/help_ticket.dart';
import '../domain/help_ticket_page.dart';
import 'help_ticket_detail_screen.dart';
import 'widgets/help_ticket_list_section.dart';

class HelpTicketsScreen extends StatefulWidget {
  final AuthUser user;

  const HelpTicketsScreen({super.key, required this.user});

  @override
  State<HelpTicketsScreen> createState() => _HelpTicketsScreenState();
}

class _HelpTicketsScreenState extends State<HelpTicketsScreen> {
  static const int pageSize = 12;

  final List<HelpTicket> _tickets = [];
  final ScrollController _scrollController = ScrollController();
  HelpTicketPageCursor? _cursor;
  bool _isLoading = true;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  bool _loadFailed = false;
  bool _autoFillInProgress = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _loadInitial();
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.helpTicketsTitle)),
      backgroundColor: ShadcnColors.background,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadInitial,
          child: ListView(
            controller: _scrollController,
            padding: const EdgeInsets.all(ShadcnSpacing.lg),
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              HelpTicketListSection(
                tickets: List<HelpTicket>.unmodifiable(_tickets),
                isLoading: _isLoading,
                isLoadingMore: _isLoadingMore,
                hasError: _loadFailed,
                onRetry: _loadInitial,
                onSelected: (ticket) => _openTicketDetail(context, ticket),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _loadInitial() async {
    setState(() {
      _isLoading = true;
      _loadFailed = false;
      _hasMore = true;
      _cursor = null;
      _tickets.clear();
    });
    await _fetchPage();
    if (!mounted) return;
    setState(() => _isLoading = false);
    _scheduleAutoFill();
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || _isLoading || !_hasMore) return;
    setState(() => _isLoadingMore = true);
    await _fetchPage();
    if (!mounted) return;
    setState(() => _isLoadingMore = false);
    _scheduleAutoFill();
  }

  Future<void> _fetchPage() async {
    final l10n = AppLocalizations.of(context)!;
    final repository = AppScope.of(context).helpTicketRepository;
    try {
      final page = await repository.fetchTicketsPage(
        uid: widget.user.uid,
        cursor: _cursor,
        limit: pageSize,
      );
      if (!mounted) return;
      setState(() {
        _tickets.addAll(page.tickets);
        _cursor = page.nextCursor;
        _hasMore = page.nextCursor != null;
        _loadFailed = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadFailed = true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.helpTicketsLoadFailed)),
      );
    }
  }

  void _onScroll() {
    if (!_scrollController.hasClients) return;
    if (_scrollController.position.extentAfter < 240) {
      _loadMore();
    }
  }

  void _scheduleAutoFill() {
    if (_autoFillInProgress || !_hasMore) return;
    _autoFillInProgress = true;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _autoFillInProgress = false;
      if (!mounted || !_scrollController.hasClients) return;
      if (_scrollController.position.maxScrollExtent < 120 &&
          !_isLoadingMore &&
          !_isLoading &&
          _hasMore) {
        _loadMore();
      }
    });
  }

  void _openTicketDetail(BuildContext context, HelpTicket ticket) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => HelpTicketDetailScreen(
          user: widget.user,
          ticketId: ticket.id,
        ),
      ),
    );
  }
}
