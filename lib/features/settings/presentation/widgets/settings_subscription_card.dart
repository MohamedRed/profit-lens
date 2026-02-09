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

  const SettingsSubscriptionCard({super.key, required this.user});

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
        return _SubscriptionTile(entitlement: entitlement);
      },
    );
  }
}

class _SubscriptionTile extends StatefulWidget {
  final Entitlement entitlement;

  const _SubscriptionTile({required this.entitlement});

  @override
  State<_SubscriptionTile> createState() => _SubscriptionTileState();
}

class _SubscriptionTileState extends State<_SubscriptionTile> {
  bool _openingPortal = false;

  Future<void> _handleAction() async {
    if (_openingPortal) {
      return;
    }
    final entitlement = widget.entitlement;
    if (entitlement.isFree) {
      await showModalBottomSheet<void>(
        context: context,
        isScrollControlled: true,
        builder: (context) => const SubscriptionPlansSheet(),
      );
      return;
    }
    setState(() => _openingPortal = true);
    final l10n = AppLocalizations.of(context)!;
    try {
      await AppScope.of(context).billingService.openCustomerPortal();
    } catch (_) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.sourceOpenError)));
    }
    if (!mounted) {
      return;
    }
    setState(() => _openingPortal = false);
  }

  @override
  Widget build(BuildContext context) {
    final entitlement = widget.entitlement;
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: ListTile(
        leading: const Icon(Icons.payment),
        title: Text(_resolvePlanTitle(context, entitlement)),
        subtitle: Text(_resolvePlanSubtitle(context, entitlement)),
        trailing: TextButton(
          onPressed: _openingPortal ? null : _handleAction,
          child: _openingPortal
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Text(
                  entitlement.isFree
                      ? l10n.upgradePlanButton
                      : l10n.managePlanButton,
                ),
        ),
      ),
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
    final plan = BillingPlans.all.cast<BillingPlan?>().firstWhere(
      (item) => item?.id == entitlement.planId,
      orElse: () => null,
    );
    if (plan == null) {
      return l10n.subscriptionActiveSubtitle;
    }
    return l10n.subscriptionActivePlan(plan.priceLabel);
  }
}
