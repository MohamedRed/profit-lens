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

  const OfferUsageCard({super.key, required this.uid});

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
  final Future<void> Function() onManage;

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
    final remaining = offerLimit == null
        ? null
        : (offerLimit - used).clamp(0, offerLimit);
    final label = remaining == null
        ? l10n.offersRemainingUnlimited
        : l10n.offersRemainingValue(remaining);
    final statusLabel = _resolveStatusLabel(context, l10n, entitlement);
    return SectionCard(
      title: l10n.offersRemainingTitle,
      children: [
        Text(label, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 6),
        Text(
          '${l10n.subscriptionStatusLabel}: $statusLabel',
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 8),
        if (entitlement.isFree)
          FilledButton(
            onPressed: onUpgrade,
            child: Text(l10n.upgradePlanButton),
          )
        else
          _ManagePlanButton(onManage: onManage),
      ],
    );
  }

  String _resolveStatusLabel(
    BuildContext context,
    AppLocalizations l10n,
    Entitlement entitlement,
  ) {
    final status = entitlement.status.toLowerCase();
    if (entitlement.cancelAtPeriodEnd &&
        (status == 'active' || status == 'trialing' || status == 'past_due')) {
      final formattedDate = MaterialLocalizations.of(
        context,
      ).formatMediumDate(entitlement.periodEnd);
      return l10n.subscriptionStatusCanceling(formattedDate);
    }
    switch (status) {
      case 'free':
        return l10n.subscriptionStatusFree;
      case 'active':
        return l10n.subscriptionStatusActive;
      case 'past_due':
        return l10n.subscriptionStatusPastDue;
      case 'canceled':
      case 'cancelled':
        return l10n.subscriptionStatusCanceled;
      case 'trialing':
        return l10n.subscriptionStatusTrialing;
      case 'incomplete':
      case 'incomplete_expired':
        return l10n.subscriptionStatusIncomplete;
      case 'unpaid':
        return l10n.subscriptionStatusUnpaid;
      default:
        return l10n.subscriptionStatusUnknown;
    }
  }
}

class _ManagePlanButton extends StatefulWidget {
  final Future<void> Function() onManage;

  const _ManagePlanButton({required this.onManage});

  @override
  State<_ManagePlanButton> createState() => _ManagePlanButtonState();
}

class _ManagePlanButtonState extends State<_ManagePlanButton>
    with WidgetsBindingObserver {
  bool _openingPortal = false;
  bool _leftApp = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (!_openingPortal) {
      return;
    }
    if (state == AppLifecycleState.inactive ||
        state == AppLifecycleState.paused) {
      _leftApp = true;
      return;
    }
    if (state == AppLifecycleState.resumed && _leftApp) {
      setState(() {
        _openingPortal = false;
        _leftApp = false;
      });
    }
  }

  Future<void> _handlePress() async {
    if (_openingPortal) {
      return;
    }
    setState(() {
      _openingPortal = true;
      _leftApp = false;
    });
    final l10n = AppLocalizations.of(context)!;
    try {
      await Future<void>.delayed(const Duration(milliseconds: 400));
      await widget.onManage();
    } catch (_) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text(l10n.sourceOpenError)));
      setState(() {
        _openingPortal = false;
        _leftApp = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return FilledButton(
      onPressed: _openingPortal ? null : _handlePress,
      child: _openingPortal
          ? Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                const SizedBox(width: 12),
                Text(l10n.loadingLabel),
              ],
            )
          : Text(l10n.managePlanButton),
    );
  }
}
