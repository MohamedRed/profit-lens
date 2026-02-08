import 'package:flutter/material.dart';

import '../../../../app/app_scope.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../billing/domain/entitlement.dart';
import '../../../billing/domain/offer_usage.dart';
import '../../../billing/presentation/subscription_plans_sheet.dart';

class OfferUsageCard extends StatelessWidget {
  final String uid;

  const OfferUsageCard({
    super.key,
    required this.uid,
  });

  @override
  Widget build(BuildContext context) {
    final services = AppScope.of(context);
    if (!AppConfig.firebaseConfigured) {
      return const SizedBox.shrink();
    }
    return StreamBuilder<Entitlement?>(
      stream: services.entitlementRepository.watchEntitlement(uid),
      builder: (context, snapshot) {
        final l10n = AppLocalizations.of(context)!;
        final entitlement = snapshot.data;
        if (entitlement == null) {
          return SectionCard(
            title: l10n.offersRemainingTitle,
            children: [
              Text(
                l10n.loadingLabel,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          );
        }
        return StreamBuilder<OfferUsage?>(
          stream: services.usageRepository.watchUsage(
            uid,
            entitlement.periodKey,
          ),
          builder: (context, usageSnapshot) {
            final usage = usageSnapshot.data;
            return _OfferUsageContent(
              entitlement: entitlement,
              usage: usage,
              onUpgrade: () => _showPlans(context),
              onManage: () => services.billingService.openCustomerPortal(),
            );
          },
        );
      },
    );
  }

  Future<void> _showPlans(BuildContext context) async {
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (context) => const SubscriptionPlansSheet(),
    );
  }
}

class _OfferUsageContent extends StatelessWidget {
  final Entitlement entitlement;
  final OfferUsage? usage;
  final VoidCallback onUpgrade;
  final VoidCallback onManage;

  const _OfferUsageContent({
    required this.entitlement,
    required this.usage,
    required this.onUpgrade,
    required this.onManage,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final offerLimit = entitlement.offerLimit;
    final used = usage?.offerCount ?? 0;
    final remaining = offerLimit == null ? null : (offerLimit - used).clamp(0, offerLimit);
    final label = remaining == null
        ? l10n.offersRemainingUnlimited
        : l10n.offersRemainingValue(remaining);
    return SectionCard(
      title: l10n.offersRemainingTitle,
      children: [
        Text(
          label,
          style: Theme.of(context).textTheme.headlineSmall,
        ),
        const SizedBox(height: 8),
        if (entitlement.isFree)
          FilledButton(
            onPressed: onUpgrade,
            child: Text(l10n.upgradePlanButton),
          )
        else
          FilledButton(
            onPressed: onManage,
            child: Text(l10n.managePlanButton),
          ),
      ],
    );
  }
}
