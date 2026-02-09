import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket.dart';
import 'help_ticket_card.dart';

class HelpTicketListSection extends StatelessWidget {
  final Stream<List<HelpTicket>> ticketStream;

  const HelpTicketListSection({
    super.key,
    required this.ticketStream,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.helpRecentTicketsTitle,
      children: [
        StreamBuilder<List<HelpTicket>>(
          stream: ticketStream,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting &&
                !snapshot.hasData) {
              return const Padding(
                padding: EdgeInsets.all(ShadcnSpacing.lg),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            final tickets = snapshot.data ?? [];
            if (tickets.isEmpty) {
              return Padding(
                padding: const EdgeInsets.all(ShadcnSpacing.lg),
                child: Text(
                  l10n.helpNoTicketsMessage,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: ShadcnColors.textSecondary,
                  ),
                ),
              );
            }
            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: tickets.length,
              separatorBuilder: (_, __) =>
                  const SizedBox(height: ShadcnSpacing.md),
              itemBuilder: (context, index) {
                return HelpTicketCard(ticket: tickets[index]);
              },
            );
          },
        ),
      ],
    );
  }
}
