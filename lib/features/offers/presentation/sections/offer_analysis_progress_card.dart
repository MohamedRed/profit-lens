import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../offer_analysis_status.dart';

class OfferAnalysisProgressCard extends StatelessWidget {
  final OfferAnalysisStatus status;
  final String? errorMessage;

  const OfferAnalysisProgressCard({
    super.key,
    required this.status,
    required this.errorMessage,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    if (status == OfferAnalysisStatus.failed) {
      return SectionCard(
        title: l10n.analysisFailedTitle,
        showSurface: false,
        showBorder: false,
        padding: EdgeInsets.zero,
        children: [Text(errorMessage ?? l10n.analysisFailedBody)],
      );
    }

    return SectionCard(
      title: l10n.analysisProgressTitle,
      showSurface: false,
      showBorder: false,
      padding: EdgeInsets.zero,
      children: [
        _StepRow(
          label: l10n.analysisStepExtracting,
          state: _stepState(status, OfferAnalysisStatus.extracting),
        ),
        const SizedBox(height: 6),
        _StepRow(
          label: l10n.analysisStepVerifyRoute,
          state: _stepState(status, OfferAnalysisStatus.verifyingRoute),
        ),
        const SizedBox(height: 6),
        _StepRow(
          label: l10n.analysisStepProfitability,
          state: _stepState(status, OfferAnalysisStatus.calculatingProfit),
        ),
      ],
    );
  }
}

enum _StepState { pending, active, done }

_StepState _stepState(OfferAnalysisStatus status, OfferAnalysisStatus step) {
  if (status == OfferAnalysisStatus.completed) {
    return _StepState.done;
  }
  if (status == OfferAnalysisStatus.extracting) {
    return step == OfferAnalysisStatus.extracting
        ? _StepState.active
        : _StepState.pending;
  }
  if (status == OfferAnalysisStatus.verifyingRoute) {
    if (step == OfferAnalysisStatus.extracting) {
      return _StepState.done;
    }
    return step == OfferAnalysisStatus.verifyingRoute
        ? _StepState.active
        : _StepState.pending;
  }
  if (status == OfferAnalysisStatus.calculatingProfit) {
    if (step == OfferAnalysisStatus.calculatingProfit) {
      return _StepState.active;
    }
    return _StepState.done;
  }
  return _StepState.pending;
}

class _StepRow extends StatelessWidget {
  final String label;
  final _StepState state;

  const _StepRow({required this.label, required this.state});

  @override
  Widget build(BuildContext context) {
    final color = Theme.of(context).colorScheme;
    Widget icon;
    switch (state) {
      case _StepState.done:
        icon = Icon(Icons.check_circle, color: color.primary, size: 18);
        break;
      case _StepState.active:
        icon = SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(
            strokeWidth: 2.4,
            color: color.primary,
          ),
        );
        break;
      case _StepState.pending:
        icon = Icon(
          Icons.radio_button_unchecked,
          color: color.outline,
          size: 18,
        );
        break;
    }
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        icon,
        const SizedBox(width: 8),
        Expanded(child: Text(label)),
      ],
    );
  }
}
