import 'dart:async';

import 'controllers/offer_flow_controller.dart';
import 'offer_analysis_status.dart';

typedef AnalysisUpdate = void Function();

class OfferAnalysisProgressDriver {
  final OfferFlowController controller;
  final int runId;
  final AnalysisUpdate onUpdated;
  final DateTime _startedAt;
  final Duration _minDuration;

  OfferAnalysisProgressDriver._({
    required this.controller,
    required this.runId,
    required this.onUpdated,
    required DateTime startedAt,
    required Duration minDuration,
  })  : _startedAt = startedAt,
        _minDuration = minDuration;

  factory OfferAnalysisProgressDriver.start({
    required OfferFlowController controller,
    required int runId,
    required AnalysisUpdate onUpdated,
    required List<OfferAnalysisStatus> steps,
    required List<Duration> stepDurations,
  }) {
    assert(steps.length == stepDurations.length);
    final driver = OfferAnalysisProgressDriver._(
      controller: controller,
      runId: runId,
      onUpdated: onUpdated,
      startedAt: DateTime.now(),
      minDuration: stepDurations.fold(
        Duration.zero,
        (total, duration) => total + duration,
      ),
    );
    driver._scheduleSteps(steps, stepDurations);
    return driver;
  }

  void _scheduleSteps(
    List<OfferAnalysisStatus> steps,
    List<Duration> stepDurations,
  ) {
    var accumulated = Duration.zero;
    for (var i = 1; i < steps.length; i += 1) {
      accumulated += stepDurations[i - 1];
      Future<void>.delayed(accumulated, () {
        if (!_isActive) return;
        if (!controller.analysisStatus.isAnalyzing) return;
        controller.setAnalysisStatus(steps[i]);
        onUpdated();
      });
    }
  }

  Future<void> waitForMinimumDuration() async {
    if (!_isActive) return;
    if (!controller.analysisStatus.isAnalyzing) return;
    final elapsed = DateTime.now().difference(_startedAt);
    final remaining = _minDuration - elapsed;
    if (remaining <= Duration.zero) return;
    await Future<void>.delayed(remaining);
  }

  bool get _isActive => controller.isCurrentAnalysis(runId);
}
