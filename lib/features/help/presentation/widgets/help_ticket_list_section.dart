import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket.dart';
import 'help_ticket_card.dart';

class HelpTicketListSection extends StatelessWidget {
  final List<HelpTicket> tickets;
  final bool isLoading;
  final bool isLoadingMore;
  final bool hasMore;
  final bool hasError;
  final VoidCallback? onRetry;
  final VoidCallback? onLoadMore;
  final ValueChanged<HelpTicket>? onSelected;

  const HelpTicketListSection({
    super.key,
    required this.tickets,
    required this.isLoading,
    required this.isLoadingMore,
    required this.hasMore,
    required this.hasError,
    this.onRetry,
    this.onLoadMore,
    this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.helpRecentTicketsTitle,
      children: [
        if (isLoading && tickets.isEmpty)
          const Padding(
            padding: EdgeInsets.all(ShadcnSpacing.lg),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (hasError && tickets.isEmpty)
          _ErrorState(onRetry: onRetry)
        else if (tickets.isEmpty)
          Padding(
            padding: const EdgeInsets.all(ShadcnSpacing.lg),
            child: Text(
              l10n.helpNoTicketsMessage,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: ShadcnColors.textSecondary,
              ),
            ),
          )
        else ...[
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: tickets.length,
            separatorBuilder: (context, index) =>
                const SizedBox(height: ShadcnSpacing.md),
            itemBuilder: (context, index) {
              final ticket = tickets[index];
              if (onSelected == null) {
                return HelpTicketCard(ticket: ticket);
              }
              return Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(ShadcnRadius.lg),
                  onTap: () => onSelected?.call(ticket),
                  child: HelpTicketCard(ticket: ticket),
                ),
              );
            },
          ),
          if (hasMore) ...[
            const SizedBox(height: ShadcnSpacing.lg),
            Center(
              child: OutlinedButton.icon(
                onPressed: isLoadingMore ? null : onLoadMore,
                icon: isLoadingMore
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.expand_more),
                label: Text(
                  isLoadingMore
                      ? l10n.helpLoadingMoreLabel
                      : l10n.helpLoadMoreButton,
                ),
              ),
            ),
          ],
        ],
      ],
    );
  }
}

class _ErrorState extends StatelessWidget {
  final VoidCallback? onRetry;

  const _ErrorState({this.onRetry});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Padding(
      padding: const EdgeInsets.all(ShadcnSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            l10n.helpTicketsLoadFailed,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: ShadcnColors.textSecondary,
            ),
          ),
          const SizedBox(height: ShadcnSpacing.md),
          OutlinedButton(
            onPressed: onRetry,
            child: Text(l10n.retryButtonLabel),
          ),
        ],
      ),
    );
  }
}
