import 'package:flutter/material.dart';

import '../../../../app/app_scope.dart';
import '../../../../core/config/app_config.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../billing/domain/billing_plan.dart';
import '../../../billing/domain/entitlement.dart';
import '../../../billing/presentation/subscription_plans_sheet.dart';
import '../../../auth/domain/auth_user.dart';

class SettingsSubscriptionCard extends StatelessWidget {
  final AuthUser user;

  const SettingsSubscriptionCard({
    super.key,
    required this.user,
  });

  @override
  Widget build(BuildContext context) {
    if (!AppConfig.firebaseConfigured) {
      return const SizedBox.shrink();
    }
    final services = AppScope.of(context);
    return StreamBuilder<Entitlement?>(
      stream: services.entitlementRepository.watchEntitlement(user.uid),
      builder: (context, snapshot) {
        final entitlement = snapshot.data;
        if (entitlement == null) {
          return const SizedBox.shrink();
        }
        return Card(
          child: ListTile(
            leading: const Icon(Icons.payment),
            title: Text(_resolvePlanTitle(context, entitlement)),
            subtitle: Text(_resolvePlanSubtitle(context, entitlement)),
            trailing: TextButton(
              onPressed: () => _handleAction(context, entitlement),
              child: Text(entitlement.isFree
                  ? AppLocalizations.of(context)!.upgradePlanButton
                  : AppLocalizations.of(context)!.managePlanButton),
            ),
          ),
        );
      },
    );
  }

  String _resolvePlanTitle(BuildContext context, Entitlement entitlement) {
    final l10n = AppLocalizations.of(context)!;
    if (entitlement.isFree) {
      return l10n.subscriptionFreeTitle;
    }
    return l10n.subscriptionActiveTitle;
  }

  String _resolvePlanSubtitle(BuildContext context, Entitlement entitlement) {
    final l10n = AppLocalizations.of(context)!;
    if (entitlement.isFree) {
      return l10n.subscriptionFreeSubtitle;
    }
    final plan = BillingPlans.all
        .cast<BillingPlan?>()
        .firstWhere(
          (item) => item?.id == entitlement.planId,
          orElse: () => null,
        );
    if (plan == null) {
      return l10n.subscriptionActiveSubtitle;
    }
    return l10n.subscriptionActivePlan(plan.priceLabel);
  }

  Future<void> _handleAction(
    BuildContext context,
    Entitlement entitlement,
  ) async {
    if (entitlement.isFree) {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        builder: (context) => const SubscriptionPlansSheet(),
      );
      return;
    }
    await AppScope.of(context).billingService.openCustomerPortal();
  }
}
