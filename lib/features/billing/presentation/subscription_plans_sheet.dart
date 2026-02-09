import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/design_system/shadcn_tokens.dart';
import '../../../core/widgets/section_card.dart';
import '../../../core/widgets/stripe_launch_overlay.dart';
import '../../../l10n/app_localizations.dart';
import '../domain/billing_plan.dart';

class SubscriptionPlansSheet extends StatelessWidget {
  const SubscriptionPlansSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(ShadcnSpacing.xxl),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                l10n.subscriptionPlansTitle,
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: ShadcnSpacing.sm),
              Text(
                l10n.subscriptionPlansSubtitle,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: ShadcnColors.textSecondary,
                ),
              ),
              const SizedBox(height: ShadcnSpacing.lg),
              ...BillingPlans.all.map(
                (plan) => Padding(
                  padding: const EdgeInsets.only(bottom: ShadcnSpacing.md),
                  child: _PlanCard(plan: plan),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final BillingPlan plan;

  const _PlanCard({required this.plan});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final offersLabel = plan.isUnlimited
        ? l10n.planUnlimitedLabel
        : l10n.planOffersPerMonth(plan.offerLimit ?? 0);
    return SectionCard(
      title: l10n.planPricePerMonth(plan.priceLabel),
      children: [
        Text(offersLabel, style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: ShadcnSpacing.md),
        FilledButton(
          onPressed: () => _startCheckout(context, plan),
          child: Text(l10n.planChooseButton),
        ),
      ],
    );
  }

  Future<void> _startCheckout(BuildContext context, BillingPlan plan) async {
    final messenger = ScaffoldMessenger.of(context);
    final l10n = AppLocalizations.of(context)!;
    final overlay = StripeLaunchOverlay.show(context, l10n.managePlanButton);
    try {
      await Future<void>.delayed(const Duration(milliseconds: 400));
      await AppScope.of(context).billingService.startCheckout(plan.priceId);
    } catch (error) {
      messenger.showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      overlay.remove();
    }
  }
}
