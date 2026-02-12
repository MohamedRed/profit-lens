import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_deliverer_status.dart';
import '../../domain/help_ticket_timeline_event.dart';
import '../help_ticket_status_presentation.dart';

class HelpTicketProgressStepper extends StatelessWidget {
  final HelpTicketDelivererStatus currentStatus;
  final List<HelpTicketTimelineEvent> events;

  const HelpTicketProgressStepper({
    super.key,
    required this.currentStatus,
    required this.events,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final steps = _steps(l10n);
    final eventsByStatus = _latestEventByStatus(events);

    return Column(
      children: [
        for (var i = 0; i < steps.length; i++)
          _ProgressStepRow(
            label: steps[i].label,
            status: _stateForStep(
              stepStatus: steps[i].status,
              currentStatus: currentStatus,
              hasEvent: eventsByStatus.containsKey(steps[i].status),
            ),
            color: helpTicketStatusColor(steps[i].status),
            event: eventsByStatus[steps[i].status],
            isLast: i == steps.length - 1,
          ),
      ],
    );
  }
}

class _ProgressStepRow extends StatelessWidget {
  final String label;
  final _ProgressStepState status;
  final Color color;
  final HelpTicketTimelineEvent? event;
  final bool isLast;

  const _ProgressStepRow({
    required this.label,
    required this.status,
    required this.color,
    required this.event,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final circleColor = switch (status) {
      _ProgressStepState.done => color,
      _ProgressStepState.current => color,
      _ProgressStepState.upcoming => ShadcnColors.outline,
    };
    final textColor = switch (status) {
      _ProgressStepState.upcoming => ShadcnColors.textSecondary,
      _ => ShadcnColors.textPrimary,
    };

    return Stack(
      children: [
        if (!isLast)
          Positioned(
            left: 11,
            top: 20,
            bottom: 0,
            child: Container(
              width: 2,
              color: status == _ProgressStepState.upcoming
                  ? ShadcnColors.outline
                  : circleColor.withValues(alpha: 0.35),
            ),
          ),
        Padding(
          padding: EdgeInsets.only(bottom: isLast ? 0 : ShadcnSpacing.sm),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 24,
                child: Align(
                  alignment: Alignment.topCenter,
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: circleColor,
                        width: status == _ProgressStepState.current ? 2 : 1.5,
                      ),
                      color: status == _ProgressStepState.upcoming
                          ? Colors.transparent
                          : circleColor.withValues(
                              alpha: status == _ProgressStepState.current
                                  ? 0.15
                                  : 1,
                            ),
                    ),
                    child: status == _ProgressStepState.done
                        ? const Icon(Icons.check, size: 12, color: Colors.white)
                        : status == _ProgressStepState.current
                        ? Center(
                            child: Container(
                              width: 8,
                              height: 8,
                              decoration: BoxDecoration(
                                color: circleColor,
                                shape: BoxShape.circle,
                              ),
                            ),
                          )
                        : null,
                  ),
                ),
              ),
              const SizedBox(width: ShadcnSpacing.md),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 1),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        label,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: textColor,
                          fontWeight: status == _ProgressStepState.current
                              ? FontWeight.w600
                              : FontWeight.w500,
                        ),
                      ),
                      if (event != null) ...[
                        const SizedBox(height: ShadcnSpacing.xs),
                        Text(
                          _formatDateTimeLine(
                            context: context,
                            l10n: l10n,
                            dateTime: event!.at,
                          ),
                          style: Theme.of(context).textTheme.labelSmall
                              ?.copyWith(color: ShadcnColors.textSecondary),
                        ),
                        const SizedBox(height: ShadcnSpacing.xs),
                        Text(
                          event!.message,
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: ShadcnColors.textSecondary),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

List<_ProgressStepDef> _steps(AppLocalizations l10n) {
  return [
    _ProgressStepDef(
      status: HelpTicketDelivererStatus.received,
      label: helpTicketStatusLabel(HelpTicketDelivererStatus.received, l10n),
    ),
    _ProgressStepDef(
      status: HelpTicketDelivererStatus.analyzing,
      label: helpTicketStatusLabel(HelpTicketDelivererStatus.analyzing, l10n),
    ),
    _ProgressStepDef(
      status: HelpTicketDelivererStatus.needsInfo,
      label: helpTicketStatusLabel(HelpTicketDelivererStatus.needsInfo, l10n),
    ),
    _ProgressStepDef(
      status: HelpTicketDelivererStatus.fixReady,
      label: helpTicketStatusLabel(HelpTicketDelivererStatus.fixReady, l10n),
    ),
    _ProgressStepDef(
      status: HelpTicketDelivererStatus.resolved,
      label: helpTicketStatusLabel(HelpTicketDelivererStatus.resolved, l10n),
    ),
  ];
}

_ProgressStepState _stateForStep({
  required HelpTicketDelivererStatus stepStatus,
  required HelpTicketDelivererStatus currentStatus,
  required bool hasEvent,
}) {
  if (stepStatus == currentStatus) {
    return _ProgressStepState.current;
  }
  if (hasEvent) {
    return _ProgressStepState.done;
  }
  return _ProgressStepState.upcoming;
}

class _ProgressStepDef {
  final HelpTicketDelivererStatus status;
  final String label;

  const _ProgressStepDef({required this.status, required this.label});
}

enum _ProgressStepState { done, current, upcoming }

Map<HelpTicketDelivererStatus, HelpTicketTimelineEvent> _latestEventByStatus(
  List<HelpTicketTimelineEvent> events,
) {
  final latestByStatus = <HelpTicketDelivererStatus, HelpTicketTimelineEvent>{};
  for (final event in events) {
    final current = latestByStatus[event.status];
    if (current == null || event.at.isAfter(current.at)) {
      latestByStatus[event.status] = event;
    }
  }
  return latestByStatus;
}

String _formatDateTimeLine({
  required BuildContext context,
  required AppLocalizations l10n,
  required DateTime dateTime,
}) {
  final localizations = MaterialLocalizations.of(context);
  final localDateTime = dateTime.toLocal();
  final date = localizations.formatShortDate(localDateTime);
  final time = localizations.formatTimeOfDay(
    TimeOfDay.fromDateTime(localDateTime),
    alwaysUse24HourFormat: true,
  );
  return '${l10n.helpTicketTimelineAtLabel} $date $time';
}
