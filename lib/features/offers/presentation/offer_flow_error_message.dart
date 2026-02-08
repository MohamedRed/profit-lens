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
      return message;
    }
  }
  return l10n.analysisFailedBody;
}
