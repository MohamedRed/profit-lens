import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../core/widgets/section_card.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/help_ticket.dart';
import '../domain/help_ticket_attachment.dart';
import 'widgets/help_ai_triage_section.dart';
import 'widgets/help_ticket_attachment_gallery.dart';
import 'widgets/help_ticket_detail_header.dart';

class HelpTicketDetailScreen extends StatelessWidget {
  final AuthUser user;
  final HelpTicket ticket;

  const HelpTicketDetailScreen({
    super.key,
    required this.user,
    required this.ticket,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final hasAiTriage =
        (ticket.aiSummary?.isNotEmpty ?? false) ||
        (ticket.aiNextSteps?.isNotEmpty ?? false);
    final attachments = AppScope.of(
      context,
    ).helpTicketRepository.watchAttachments(uid: user.uid, ticketId: ticket.id);
    return Scaffold(
      appBar: AppBar(title: Text(l10n.helpTicketDetailTitle)),
      body: ListView(
        padding: const EdgeInsets.all(ShadcnSpacing.lg),
        children: [
          HelpTicketDetailHeader(ticket: ticket),
          const SizedBox(height: ShadcnSpacing.lg),
          SectionCard(
            title: l10n.helpTicketDescriptionTitle,
            children: [
              Text(
                ticket.description.isEmpty
                    ? l10n.helpTicketDescriptionEmpty
                    : ticket.description,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
          const SizedBox(height: ShadcnSpacing.lg),
          if (hasAiTriage) ...[
            HelpAiTriageSection(ticket: ticket),
            const SizedBox(height: ShadcnSpacing.lg),
          ],
          SectionCard(
            title: l10n.helpTicketAttachmentsTitle,
            children: [
              StreamBuilder<List<HelpTicketAttachment>>(
                stream: attachments,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting &&
                      !snapshot.hasData) {
                    return const Center(
                      child: Padding(
                        padding: EdgeInsets.all(ShadcnSpacing.lg),
                        child: CircularProgressIndicator(),
                      ),
                    );
                  }
                  final items = snapshot.data ?? [];
                  return HelpTicketAttachmentGallery(attachments: items);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}
