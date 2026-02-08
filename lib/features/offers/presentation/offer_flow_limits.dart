import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/config/app_config.dart';
import '../../../l10n/app_localizations.dart';

Future<bool> ensureWithinOfferLimit(
  BuildContext context,
  String uid,
) async {
  if (!AppConfig.firebaseConfigured) {
    return true;
  }
  final services = AppScope.of(context);
  try {
    final entitlement = await services.entitlementRepository.fetchEntitlement(uid);
    if (entitlement == null || entitlement.offerLimit == null) {
      return true;
    }
    final usage =
        await services.usageRepository.fetchUsage(uid, entitlement.periodKey);
    final used = usage?.offerCount ?? 0;
    if (used >= entitlement.offerLimit!) {
      if (context.mounted) {
        final l10n = AppLocalizations.of(context)!;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.offerLimitReachedMessage)),
        );
      }
      return false;
    }
    return true;
  } catch (_) {
    return true;
  }
}
