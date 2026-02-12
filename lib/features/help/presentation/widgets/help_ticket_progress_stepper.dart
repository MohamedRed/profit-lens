import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/help_ticket_deliverer_status.dart';
import '../help_ticket_status_presentation.dart';

class HelpTicketProgressStepper extends StatelessWidget {
  final HelpTicketDelivererStatus currentStatus;

  const HelpTicketProgressStepper({super.key, required this.currentStatus});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final steps = _steps(l10n);
    final currentIndex = steps.indexWhere(
      (step) => step.status == currentStatus,
    );

    return Column(
      children: [
        for (var i = 0; i < steps.length; i++) ...[
          _ProgressStepRow(
            label: steps[i].label,
            status: _stateForStep(i, currentIndex),
            color: helpTicketStatusColor(steps[i].status),
            isLast: i == steps.length - 1,
          ),
          if (i != steps.length - 1) const SizedBox(height: ShadcnSpacing.sm),
        ],
      ],
    );
  }
}

class _ProgressStepRow extends StatelessWidget {
  final String label;
  final _ProgressStepState status;
  final Color color;
  final bool isLast;

  const _ProgressStepRow({
    required this.label,
    required this.status,
    required this.color,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    final circleColor = switch (status) {
      _ProgressStepState.done => color,
      _ProgressStepState.current => color,
      _ProgressStepState.upcoming => ShadcnColors.outline,
    };
    final textColor = switch (status) {
      _ProgressStepState.upcoming => ShadcnColors.textSecondary,
      _ => ShadcnColors.textPrimary,
    };

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 24,
          child: Column(
            children: [
              Container(
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
              if (!isLast)
                Container(
                  width: 2,
                  height: 24,
                  color: status == _ProgressStepState.upcoming
                      ? ShadcnColors.outline
                      : circleColor.withValues(alpha: 0.35),
                ),
            ],
          ),
        ),
        const SizedBox(width: ShadcnSpacing.md),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 1),
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: textColor,
                fontWeight: status == _ProgressStepState.current
                    ? FontWeight.w600
                    : FontWeight.w500,
              ),
            ),
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

_ProgressStepState _stateForStep(int stepIndex, int currentIndex) {
  if (stepIndex == currentIndex) {
    return _ProgressStepState.current;
  }
  if (stepIndex < currentIndex) {
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
