import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/help_ticket.dart';
import 'help_ticket_detail_screen.dart';
import 'widgets/help_ticket_list_section.dart';

class HelpTicketsScreen extends StatelessWidget {
  final AuthUser user;

  const HelpTicketsScreen({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final repository = AppScope.of(context).helpTicketRepository;
    final ticketStream = repository.watchTickets(user.uid);

    return Scaffold(
      appBar: AppBar(title: Text(l10n.helpTicketsTitle)),
      backgroundColor: ShadcnColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(ShadcnSpacing.lg),
          children: [
            HelpTicketListSection(
              ticketStream: ticketStream,
              onSelected: (ticket) => _openTicketDetail(context, ticket),
            ),
          ],
        ),
      ),
    );
  }

  void _openTicketDetail(BuildContext context, HelpTicket ticket) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => HelpTicketDetailScreen(
          user: user,
          ticketId: ticket.id,
        ),
      ),
    );
  }
}
