import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../domain/help_ticket.dart';
import '../domain/help_ticket_attachment.dart';
import '../domain/help_ticket_timeline_event.dart';
import '../domain/help_ticket_transcription_status.dart';
import 'widgets/help_ai_triage_section.dart';
import 'widgets/help_ticket_progress_stepper.dart';
import 'widgets/help_section_card.dart';
import 'widgets/help_ticket_attachment_gallery.dart';
import 'widgets/help_ticket_detail_header.dart';
import 'widgets/help_ticket_timeline_section.dart';

class HelpTicketDetailScreen extends StatelessWidget {
  final AuthUser user;
  final String ticketId;

  const HelpTicketDetailScreen({
    super.key,
    required this.user,
    required this.ticketId,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final repository = AppScope.of(context).helpTicketRepository;
    final ticketStream = repository.watchTicket(
      uid: user.uid,
      ticketId: ticketId,
    );
    final attachments = repository.watchAttachments(
      uid: user.uid,
      ticketId: ticketId,
    );
    final timeline = repository.watchTimeline(
      uid: user.uid,
      ticketId: ticketId,
    );
    return Scaffold(
      appBar: AppBar(title: Text(l10n.helpTicketDetailTitle)),
      backgroundColor: ShadcnColors.background,
      body: StreamBuilder<HelpTicket?>(
        stream: ticketStream,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              !snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final ticket = snapshot.data;
          if (ticket == null) {
            return Center(child: Text(l10n.helpTicketNotFound));
          }
          final hasAiTriage =
              (ticket.aiSummary?.isNotEmpty ?? false) ||
              (ticket.aiNextSteps?.isNotEmpty ?? false);
          return ListView(
            padding: const EdgeInsets.all(ShadcnSpacing.lg),
            children: [
              HelpTicketDetailHeader(ticket: ticket),
              const SizedBox(height: ShadcnSpacing.lg),
              HelpSectionCard(
                title: l10n.helpTicketProgressTitle,
                children: [
                  StreamBuilder<List<HelpTicketTimelineEvent>>(
                    stream: timeline,
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
                      final timelineData = snapshot.data ?? [];
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          HelpTicketProgressStepper(
                            currentStatus: ticket.delivererStatus,
                          ),
                          const SizedBox(height: ShadcnSpacing.xl),
                          Text(
                            l10n.helpTicketTimelineTitle,
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                          const SizedBox(height: ShadcnSpacing.md),
                          HelpTicketTimelineSection(events: timelineData),
                        ],
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: ShadcnSpacing.lg),
              HelpSectionCard(
                title: l10n.helpTicketDescriptionTitle,
                children: [
                  Text(
                    _resolveDescriptionText(l10n, ticket),
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
              const SizedBox(height: ShadcnSpacing.lg),
              if (hasAiTriage) ...[
                HelpAiTriageSection(ticket: ticket),
                const SizedBox(height: ShadcnSpacing.lg),
              ],
              HelpSectionCard(
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
          );
        },
      ),
    );
  }
}

String _resolveDescriptionText(AppLocalizations l10n, HelpTicket ticket) {
  if (ticket.description.isNotEmpty) {
    return ticket.description;
  }
  if (ticket.transcriptionStatus == HelpTicketTranscriptionStatus.pending) {
    return l10n.helpAudioTranscribingLabel;
  }
  if (ticket.transcriptionStatus == HelpTicketTranscriptionStatus.failed) {
    return l10n.helpAudioTranscriptionFailed;
  }
  return l10n.helpTicketDescriptionEmpty;
}
