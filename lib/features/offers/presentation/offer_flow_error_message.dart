import 'package:cloud_functions/cloud_functions.dart';

import '../../../l10n/app_localizations.dart';

String resolveAnalysisErrorMessage(
  Object error,
  AppLocalizations l10n,
) {
  if (error is FirebaseFunctionsException) {
    if (error.code == 'resource-exhausted') {
      return l10n.offerLimitReachedMessage;
    }
    final message = error.message?.trim();
    if (message != null && message.isNotEmpty) {
      if (_isScreenshotExtractionFailure(message)) {
        return l10n.analysisFailedScreenshotBody;
      }
      return message;
    }
  }
  return l10n.analysisFailedBody;
}

bool _isScreenshotExtractionFailure(String message) {
  final normalized = message.toLowerCase();
  return normalized.contains('gemini') ||
      normalized.contains('extraction') ||
      normalized.contains('no offer');
}
