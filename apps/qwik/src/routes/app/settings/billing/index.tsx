import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Button } from '../../../../components/ui/button';
import { Select } from '../../../../components/ui/select';
import { useAuth } from '../../../../lib/auth/auth-context';
import { billingPlans } from '../../../../lib/config/runtime-config';
import {
  changeSubscriptionPlan,
  openStripeBillingPortal,
  setSubscriptionCancellation,
  startCheckout,
  watchEntitlement,
  watchUsage,
} from '../../../../lib/features/billing/billing-service';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { Entitlement, OfferUsage } from '../../../../lib/types/billing';
import { BillingStripePortalCard } from './billing-sections';

const formatDate = (locale: string, date: Date): string => {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const resolveDefaultPlanPriceId = (): string => {
  return billingPlans.find((plan) => Boolean(plan.priceId))?.priceId ?? '';
};

const resolveSelectedPriceId = (entitlement: Entitlement | null): string => {
  if (!entitlement) {
    return '';
  }
  if (
    entitlement.stripePriceId &&
    billingPlans.some((plan) => plan.priceId === entitlement.stripePriceId)
  ) {
    return entitlement.stripePriceId;
  }
  const byPlanId = billingPlans.find((plan) => plan.id === entitlement.planId);
  if (byPlanId?.priceId) {
    return byPlanId.priceId;
  }
  const byOfferLimit = billingPlans.find(
    (plan) => plan.offerLimit === entitlement.offerLimit && Boolean(plan.priceId),
  );
  if (byOfferLimit?.priceId) {
    return byOfferLimit.priceId;
  }
  return resolveDefaultPlanPriceId();
};

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const locale = i18n.locale.value;

  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);
  const selectedPlanPriceId = useSignal(resolveDefaultPlanPriceId());
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
    const uid = track(() => auth.user.value?.uid);
    if (!uid) {
      entitlement.value = null;
      usage.value = null;
      selectedPlanPriceId.value = resolveDefaultPlanPriceId();
      return;
    }

    let unsubscribeUsage: (() => void) | null = null;
    const unsubscribeEntitlement = watchEntitlement(uid, (nextEntitlement) => {
      entitlement.value = nextEntitlement;
      const resolved = resolveSelectedPriceId(nextEntitlement);
      const isKnownPlan = billingPlans.some((plan) => plan.priceId === resolved);
      selectedPlanPriceId.value = isKnownPlan ? resolved : resolveDefaultPlanPriceId();
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
      unsubscribeEntitlement();
      if (unsubscribeUsage) {
        unsubscribeUsage();
      }
    });
  });

  const isFreePlan = entitlement.value?.planId.toLowerCase() === 'free' || entitlement.value == null;
  const offerLimit = entitlement.value?.offerLimit ?? null;
  const usedOffers = usage.value?.offerCount ?? 0;
  const remainingOffers = offerLimit == null ? null : Math.max(0, offerLimit - usedOffers);
  const planOptions = billingPlans
    .filter((plan) => Boolean(plan.priceId))
    .map((plan) => ({
      value: plan.priceId,
      offerLimit: plan.offerLimit,
      label:
        plan.offerLimit == null
          ? `${plan.priceLabel} · ${t(i18n, 'planUnlimitedLabel', 'Unlimited offers')}`
          : `${plan.priceLabel} · ${formatTemplate(t(i18n, 'planOffersPerMonth', '{count} offers per month'), { count: plan.offerLimit })}`,
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
      await changeSubscriptionPlan(selectedPlanPriceId.value);
      statusTone.value = 'success';
      status.value = t(i18n, 'billingPlanChangeSuccess', 'Subscription plan updated.');
    } catch (error) {
      statusTone.value = 'error';
      status.value = error instanceof Error ? error.message : String(error);
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
      await setSubscriptionCancellation(nextCancelState);
      statusTone.value = 'success';
      status.value = nextCancelState
        ? t(i18n, 'billingCancelSuccess', 'Subscription will cancel at period end.')
        : t(i18n, 'billingResumeSuccess', 'Subscription resumed.');
    } catch (error) {
      statusTone.value = 'error';
      status.value = error instanceof Error ? error.message : String(error);
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
      status.value = error instanceof Error ? error.message : String(error);
    } finally {
      actionLoading.value = false;
    }
  });

  return (
    <div class="ui-settings-billing-root">
      <Link class="ui-help-detail-back" href="/next/app/settings">
        <span class="material-icons-outlined" aria-hidden="true">chevron_left</span>
        <span>{t(i18n, 'billingBackToSettings', 'Back to settings')}</span>
      </Link>

      <section class="ui-settings-card ui-settings-billing-card">
        <h2 class="ui-settings-billing-title">{t(i18n, 'billingManageTitle', 'Manage subscription')}</h2>
        <p class="ui-settings-subtitle">
          {t(i18n, 'billingManageSubtitle', 'Change plan, pause cancellation, or schedule cancellation.')}
        </p>
        {entitlement.value ? (
          <p class="ui-settings-subtitle">
            {t(i18n, 'subscriptionStatusLabel', 'Subscription status')}:{' '}
            <strong>{entitlement.value.status}</strong>
          </p>
        ) : null}
        {entitlement.value && remainingOffers != null ? (
          <p class="ui-settings-subtitle">
            {formatTemplate(t(i18n, 'offersRemainingValue', '{remaining} remaining this month'), {
              remaining: String(remainingOffers),
              count: String(remainingOffers),
            })}
          </p>
        ) : null}
        {entitlement.value ? (
          <p class="ui-settings-subtitle">
            {formatTemplate(t(i18n, 'billingPeriodEndsOn', 'Period ends on {date}'), {
              date: formatDate(locale, entitlement.value.periodEnd),
            })}
          </p>
        ) : null}
        {entitlement.value?.cancelAtPeriodEnd ? (
          <p class="ui-settings-billing-alert">
            {formatTemplate(t(i18n, 'subscriptionStatusCanceling', 'Cancels on {date}'), {
              date: formatDate(locale, entitlement.value.periodEnd),
            })}
          </p>
        ) : null}
      </section>

      <section class="ui-settings-card ui-settings-billing-card">
        <p class="ui-settings-title">{t(i18n, 'billingPlanSelectionLabel', 'Plan')}</p>
        <Select
          id="billing-plan-select"
          class="ui-select ui-settings-language-select"
          options={planOptions}
          value={selectedPlanPriceId.value}
          disabled={planOptions.length === 0}
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
        <section class="ui-settings-card ui-settings-billing-card">
          <p class="ui-settings-title">{t(i18n, 'billingCancellationTitle', 'Cancellation')}</p>
          <p class="ui-settings-subtitle">
            {t(
              i18n,
              'billingCancellationSubtitle',
              'Choose whether to keep renewing or stop at the end of this billing period.',
            )}
          </p>
          <Button
            variant={entitlement.value?.cancelAtPeriodEnd ? 'secondary' : 'destructive'}
            class="ui-settings-billing-action"
            disabled={actionLoading.value}
            onClick$={toggleCancellation$}
          >
            {entitlement.value?.cancelAtPeriodEnd
              ? t(i18n, 'billingResumeSubscriptionButton', 'Resume subscription')
              : t(i18n, 'billingCancelAtPeriodEndButton', 'Cancel at period end')}
          </Button>
        </section>
      ) : null}

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

      {status.value ? (
        <p class={statusTone.value === 'error' ? 'ui-status ui-status-error' : 'ui-status ui-status-success'}>
          {status.value}
        </p>
      ) : null}
    </div>
  );
});
