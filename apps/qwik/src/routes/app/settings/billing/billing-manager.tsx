import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { VisualOptionPicker } from '../../../../components/ui/visual-option-picker';
import { billingPlans } from '../../../../lib/config/runtime-config';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import {
  changeSubscriptionPlan,
  fetchManagedSubscriptionState,
  openStripeBillingPortal,
  setSubscriptionCancellation,
  startCheckout,
  watchEntitlement,
  watchUsage,
} from '../../../../lib/features/billing/billing-service';
import { formatBillingPlanLabel } from '../../../../lib/features/billing/billing-plan-format';
import { shouldAttemptStripeEntitlementRepair } from '../../../../lib/features/billing/entitlement-repair';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { Entitlement, ManagedSubscriptionStateSnapshot, OfferUsage } from '../../../../lib/types/billing';
import { appendDuplicateCleanupNotice, buildDuplicateCleanupNotice } from './billing-status-message';
import { BillingFeedbackBanner } from './billing-feedback-banner';
import { resolveDefaultPlanPriceId, resolveSelectedPriceId } from './billing-manager-helpers';
import { BillingCancellationCard } from './billing-cancellation-card';
import { BillingOngoingSubscriptionsEntryCard } from './billing-ongoing-subscriptions-entry-card';
import { BillingStripePortalCard } from './billing-sections';
import { BillingSummaryCard } from './billing-summary-card';

interface BillingManagerProps {
  uid: string | null;
  rootClass?: string;
}

export const BillingManager = component$<BillingManagerProps>((props) => {
  const i18n = useI18n();
  const locale = i18n.locale.value;
  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);
  const selectedPlanPriceId = useSignal(resolveDefaultPlanPriceId());
  const planSelectionDirty = useSignal(false);
  const managedSubscriptionState = useSignal<ManagedSubscriptionStateSnapshot | null>(null);
  const actionLoading = useSignal(false);
  const status = useSignal('');
  const statusTone = useSignal<'success' | 'error'>('success');
  useVisibleTask$(({ cleanup }) => {
    const resetLoadingState = () => {
      actionLoading.value = false;
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        resetLoadingState();
      }
    };

    resetLoadingState();
    window.addEventListener('pageshow', resetLoadingState);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    cleanup(() => {
      window.removeEventListener('pageshow', resetLoadingState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    });
  });

  useVisibleTask$(({ track, cleanup }) => {
    const uid = track(() => props.uid);
    if (!uid) {
      entitlement.value = null;
      usage.value = null;
      managedSubscriptionState.value = null;
      planSelectionDirty.value = false;
      selectedPlanPriceId.value = resolveDefaultPlanPriceId();
      return;
    }

    let unsubscribeUsage: (() => void) | null = null;
    let usagePeriodKey: string | null = null;
    let isActive = true;
    let entitlementRepairAttempted = false;

    const loadManagedSubscriptions = async (
      nextEntitlement: Entitlement | null,
      options: { allowFreeRepair: boolean },
    ) => {
      if (!isActive) {
        return;
      }
      const isFreeEntitlement = !nextEntitlement || nextEntitlement.planId.toLowerCase() === 'free';
      if (isFreeEntitlement && !options.allowFreeRepair) {
        managedSubscriptionState.value = null;
        return;
      }
      try {
        const nextState = await fetchManagedSubscriptionState();
        managedSubscriptionState.value = nextState;
        if (nextState.duplicateCleanupScheduledCount > 0) {
          statusTone.value = 'success';
          status.value = buildDuplicateCleanupNotice(i18n, nextState.duplicateCleanupScheduledCount);
        }
      } catch {
        managedSubscriptionState.value = null;
      }
    };

    const unsubscribeEntitlement = watchEntitlement(uid, (nextEntitlement) => {
      entitlement.value = nextEntitlement;
      const resolved = resolveSelectedPriceId(nextEntitlement);
      const isKnownPlan = billingPlans.some((plan) => plan.priceId === resolved);
      const shouldSyncSelectedPlan =
        !planSelectionDirty.value || selectedPlanPriceId.value === resolved;
      if (shouldSyncSelectedPlan) {
        selectedPlanPriceId.value = isKnownPlan ? resolved : resolveDefaultPlanPriceId();
        planSelectionDirty.value = false;
      }
      const allowFreeRepair =
        !entitlementRepairAttempted && shouldAttemptStripeEntitlementRepair(nextEntitlement);
      if (allowFreeRepair) {
        entitlementRepairAttempted = true;
      }
      void loadManagedSubscriptions(nextEntitlement, { allowFreeRepair });
      const nextUsagePeriodKey = nextEntitlement?.periodKey ?? null;
      if (nextUsagePeriodKey !== usagePeriodKey) {
        usagePeriodKey = nextUsagePeriodKey;
        usage.value = null;
        if (unsubscribeUsage) {
          unsubscribeUsage();
          unsubscribeUsage = null;
        }
        if (nextUsagePeriodKey) {
          unsubscribeUsage = watchUsage(uid, nextUsagePeriodKey, (nextUsage) => {
            usage.value = nextUsage;
          });
        }
      }
    });

    cleanup(() => {
      isActive = false;
      unsubscribeEntitlement();
      if (unsubscribeUsage) {
        unsubscribeUsage();
      }
    });
  });

  const isFreePlan = entitlement.value?.planId.toLowerCase() === 'free' || entitlement.value == null;
  const planOptions = billingPlans
    .filter((plan) => Boolean(plan.priceId))
    .map((plan) => ({
      value: plan.priceId,
      label: formatBillingPlanLabel(locale, plan),
      subtitle:
        plan.offerLimit == null
          ? t(i18n, 'planUnlimitedLabel', 'Unlimited offers')
          : formatTemplate(t(i18n, 'planOffersPerMonth', '{count} offers per month'), {
              count: plan.offerLimit,
            }),
      icon:
        plan.offerLimit == null ? 'all_inclusive' : plan.offerLimit >= 1000 ? 'rocket_launch' : 'workspace_premium',
    }));

  const applyPlan$ = $(async () => {
    if (actionLoading.value) {
      return;
    }
    if (!selectedPlanPriceId.value) {
      statusTone.value = 'error';
      status.value = t(i18n, 'billingPlanMissingError', 'Select a subscription plan first.');
      return;
    }

    actionLoading.value = true;
    status.value = '';
    try {
      if (isFreePlan) {
        await startCheckout(selectedPlanPriceId.value);
        return;
      }
      const nextState = await changeSubscriptionPlan(selectedPlanPriceId.value);
      managedSubscriptionState.value = nextState;
      planSelectionDirty.value = false;
      statusTone.value = 'success';
      status.value = appendDuplicateCleanupNotice(
        i18n,
        t(i18n, 'billingPlanChangeSuccess', 'Subscription plan updated.'),
        nextState.duplicateCleanupScheduledCount,
      );
    } catch (error) {
      statusTone.value = 'error';
      status.value = resolveUserFacingErrorMessage(i18n, error, 'billing');
    } finally {
      actionLoading.value = false;
    }
  });

  const toggleCancellation$ = $(async () => {
    if (actionLoading.value || !entitlement.value || isFreePlan) {
      return;
    }
    actionLoading.value = true;
    status.value = '';
    try {
      const nextCancelState = !entitlement.value.cancelAtPeriodEnd;
      const nextState = await setSubscriptionCancellation(nextCancelState);
      managedSubscriptionState.value = nextState;
      statusTone.value = 'success';
      status.value = appendDuplicateCleanupNotice(
        i18n,
        nextCancelState
          ? t(i18n, 'billingCancelSuccess', 'Subscription will cancel at period end.')
          : t(i18n, 'billingResumeSuccess', 'Subscription resumed.'),
        nextState.duplicateCleanupScheduledCount,
      );
    } catch (error) {
      statusTone.value = 'error';
      status.value = resolveUserFacingErrorMessage(i18n, error, 'billing');
    } finally {
      actionLoading.value = false;
    }
  });

  const openStripePortal$ = $(async () => {
    if (actionLoading.value || isFreePlan) {
      return;
    }
    actionLoading.value = true;
    status.value = '';
    try {
      await openStripeBillingPortal();
    } catch (error) {
      statusTone.value = 'error';
      status.value = resolveUserFacingErrorMessage(i18n, error, 'billing');
    } finally {
      actionLoading.value = false;
    }
  });

  const rootClassName = props.rootClass ? `ui-settings-billing-root ${props.rootClass}` : 'ui-settings-billing-root';

  return (
    <div class={rootClassName}>
      <BillingSummaryCard entitlement={entitlement.value} managedState={managedSubscriptionState.value} usage={usage.value} />

      <section class="ui-settings-card ui-settings-billing-card">
        <p class="ui-settings-title">{t(i18n, 'billingPlanSelectionLabel', 'Plan')}</p>
        <VisualOptionPicker
          ariaLabel={t(i18n, 'billingPlanSelectionLabel', 'Plan')}
          columns={1}
          options={planOptions}
          value={selectedPlanPriceId.value}
          disabled={planOptions.length === 0 || actionLoading.value}
          onChange$={(next) => {
            selectedPlanPriceId.value = String(next);
            planSelectionDirty.value = true;
          }}
        />
        <Button
          variant="default"
          class="ui-settings-billing-action"
          disabled={actionLoading.value || !selectedPlanPriceId.value}
          onClick$={applyPlan$}
        >
          {isFreePlan
            ? t(i18n, 'upgradePlanButton', 'Upgrade plan')
            : t(i18n, 'billingApplyPlanButton', 'Apply plan change')}
        </Button>
      </section>

      {!isFreePlan ? (
        <BillingStripePortalCard
          title={t(i18n, 'billingStripePortalTitle', 'Stripe billing')}
          subtitle={t(
            i18n,
            'billingStripePortalSubtitle',
            'Open Stripe to manage invoices, payment methods, and billing details.',
          )}
          buttonLabel={t(i18n, 'billingStripePortalButton', 'Open Stripe billing')}
          disabled={actionLoading.value}
          onOpen$={openStripePortal$}
        />
      ) : null}

      {!isFreePlan ? (
        <BillingCancellationCard
          cancelAtPeriodEnd={Boolean(entitlement.value?.cancelAtPeriodEnd)}
          disabled={actionLoading.value}
          onToggle$={toggleCancellation$}
        />
      ) : null}

      {!isFreePlan ? (
        <BillingOngoingSubscriptionsEntryCard
          managedSubscriptionCount={managedSubscriptionState.value?.managedSubscriptions.length ?? 0}
          href="/next/app/settings/billing/subscriptions?backTo=/next/app/settings/billing"
        />
      ) : null}

      <BillingFeedbackBanner message={status.value} tone={statusTone.value} />
    </div>
  );
});
