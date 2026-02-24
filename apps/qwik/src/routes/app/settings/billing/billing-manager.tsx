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
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { Entitlement, ManagedSubscriptionStateSnapshot, OfferUsage } from '../../../../lib/types/billing';
import { resolveDefaultPlanPriceId, resolveSelectedPriceId } from './billing-manager-helpers';
import { BillingCancellationCard } from './billing-cancellation-card';
import { BillingOngoingSubscriptionsCard } from './billing-ongoing-subscriptions-card';
import { BillingStripePortalCard } from './billing-sections';
import { BillingSummaryCard } from './billing-summary-card';

interface BillingManagerProps {
  uid: string | null;
  rootClass?: string;
}

export const BillingManager = component$<BillingManagerProps>((props) => {
  const i18n = useI18n();

  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);
  const selectedPlanPriceId = useSignal(resolveDefaultPlanPriceId());
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
      selectedPlanPriceId.value = resolveDefaultPlanPriceId();
      return;
    }

    let unsubscribeUsage: (() => void) | null = null;
    let isActive = true;

    const loadManagedSubscriptions = async (nextEntitlement: Entitlement | null) => {
      if (!isActive) {
        return;
      }
      if (!nextEntitlement || nextEntitlement.planId.toLowerCase() === 'free') {
        managedSubscriptionState.value = null;
        return;
      }
      try {
        managedSubscriptionState.value = await fetchManagedSubscriptionState();
      } catch {
        managedSubscriptionState.value = null;
      }
    };

    const unsubscribeEntitlement = watchEntitlement(uid, (nextEntitlement) => {
      entitlement.value = nextEntitlement;
      const resolved = resolveSelectedPriceId(nextEntitlement);
      const isKnownPlan = billingPlans.some((plan) => plan.priceId === resolved);
      selectedPlanPriceId.value = isKnownPlan ? resolved : resolveDefaultPlanPriceId();
      void loadManagedSubscriptions(nextEntitlement);
      usage.value = null;
      if (unsubscribeUsage) {
        unsubscribeUsage();
        unsubscribeUsage = null;
      }
      if (nextEntitlement?.periodKey) {
        unsubscribeUsage = watchUsage(uid, nextEntitlement.periodKey, (nextUsage) => {
          usage.value = nextUsage;
        });
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
      label: plan.priceLabel,
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
      managedSubscriptionState.value = await changeSubscriptionPlan(selectedPlanPriceId.value);
      statusTone.value = 'success';
      status.value = t(i18n, 'billingPlanChangeSuccess', 'Subscription plan updated.');
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
      managedSubscriptionState.value = await setSubscriptionCancellation(nextCancelState);
      statusTone.value = 'success';
      status.value = nextCancelState
        ? t(i18n, 'billingCancelSuccess', 'Subscription will cancel at period end.')
        : t(i18n, 'billingResumeSuccess', 'Subscription resumed.');
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

  const rootClassName = props.rootClass
    ? `ui-settings-billing-root ${props.rootClass}`
    : 'ui-settings-billing-root';

  return (
    <div class={rootClassName}>
      <BillingSummaryCard entitlement={entitlement.value} usage={usage.value} />

      {!isFreePlan ? (
        <BillingOngoingSubscriptionsCard
          primarySubscriptionId={
            managedSubscriptionState.value?.primarySubscriptionId ?? entitlement.value?.stripeSubscriptionId ?? null
          }
          subscriptions={managedSubscriptionState.value?.managedSubscriptions ?? []}
        />
      ) : null}

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

      {status.value ? (
        <p class={`ui-settings-billing-feedback ui-settings-billing-feedback-${statusTone.value}`}>{status.value}</p>
      ) : null}
    </div>
  );
});
