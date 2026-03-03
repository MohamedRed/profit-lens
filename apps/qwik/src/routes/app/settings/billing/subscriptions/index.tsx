import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../../../../lib/auth/auth-context';
import { resolveUserFacingErrorMessage } from '../../../../../lib/errors/user-facing-error';
import {
  fetchManagedSubscriptionState,
  openStripeBillingPortal,
  watchEntitlement,
} from '../../../../../lib/features/billing/billing-service';
import { attachReturnToAppLoadingReset } from '../../../../../lib/features/billing/loading-return-reset';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type {
  Entitlement,
  ManagedSubscriptionStateSnapshot,
} from '../../../../../lib/types/billing';
import { BillingFeedbackBanner } from '../billing-feedback-banner';
import { shouldRedirectFromOngoingSubscriptionsDetail } from '../billing-ongoing-subscriptions-guard';
import { BillingOngoingSubscriptionsCard } from '../billing-ongoing-subscriptions-card';
import { BillingStripePortalCard } from '../billing-sections';

export default component$(() => {
  const auth = useAuth();
  const navigate = useNavigate();
  const i18n = useI18n();

  const entitlement = useSignal<Entitlement | null>(null);
  const managedSubscriptionState = useSignal<ManagedSubscriptionStateSnapshot | null>(null);
  const managedStateLoading = useSignal(false);
  const actionLoading = useSignal(false);
  const status = useSignal('');
  const statusTone = useSignal<'success' | 'error'>('success');
  useVisibleTask$(({ cleanup }) => {
    const removeListeners = attachReturnToAppLoadingReset(() => {
      actionLoading.value = false;
    });
    cleanup(removeListeners);
  });

  useVisibleTask$(({ track, cleanup }) => {
    const uid = track(() => auth.user.value?.uid ?? null);
    entitlement.value = null;
    managedSubscriptionState.value = null;
    managedStateLoading.value = false;
    status.value = '';

    if (!uid) {
      return;
    }

    let isActive = true;
    let fetchRunId = 0;

    const unsubscribeEntitlement = watchEntitlement(uid, (nextEntitlement) => {
      entitlement.value = nextEntitlement;
      const normalizedPlanId = nextEntitlement?.planId.trim().toLowerCase() ?? '';
      const normalizedStatus = nextEntitlement?.status.trim().toLowerCase() ?? '';
      const isFreeEntitlement =
        !nextEntitlement || normalizedPlanId === 'free' || normalizedStatus === 'free';

      if (isFreeEntitlement) {
        fetchRunId += 1;
        managedSubscriptionState.value = null;
        managedStateLoading.value = false;
        return;
      }

      const currentRunId = ++fetchRunId;
      managedStateLoading.value = true;

      void fetchManagedSubscriptionState()
        .then((nextState) => {
          if (!isActive || currentRunId !== fetchRunId) {
            return;
          }
          managedSubscriptionState.value = nextState;
          status.value = '';
        })
        .catch((error) => {
          if (!isActive || currentRunId !== fetchRunId) {
            return;
          }
          managedSubscriptionState.value = null;
          statusTone.value = 'error';
          status.value = resolveUserFacingErrorMessage(i18n, error, 'billing');
        })
        .finally(() => {
          if (!isActive || currentRunId !== fetchRunId) {
            return;
          }
          managedStateLoading.value = false;
        });
    });

    cleanup(() => {
      isActive = false;
      fetchRunId += 1;
      unsubscribeEntitlement();
    });
  });

  useVisibleTask$(({ track }) => {
    const uid = track(() => auth.user.value?.uid ?? null);
    const nextEntitlement = track(() => entitlement.value);
    const isManagedStateLoading = track(() => managedStateLoading.value);
    const managedSubscriptionCount = track(
      () => managedSubscriptionState.value?.managedSubscriptions.length ?? null,
    );

    if (
      shouldRedirectFromOngoingSubscriptionsDetail({
        uid,
        entitlement: nextEntitlement,
        isManagedStateLoading,
        managedSubscriptionCount,
      })
    ) {
      void navigate('/next/app/settings/billing');
    }
  });

  const openStripePortal$ = $(async () => {
    if (actionLoading.value) {
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

  const managedSubscriptionCount = managedSubscriptionState.value?.managedSubscriptions.length ?? null;
  const shouldRedirect = shouldRedirectFromOngoingSubscriptionsDetail({
    uid: auth.user.value?.uid ?? null,
    entitlement: entitlement.value,
    isManagedStateLoading: managedStateLoading.value,
    managedSubscriptionCount,
  });

  if (shouldRedirect) {
    return null;
  }

  return (
    <div class="ui-settings-billing-root">
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

      <BillingOngoingSubscriptionsCard
        disabled={actionLoading.value}
        onManageInStripe$={openStripePortal$}
        primarySubscriptionId={
          managedSubscriptionState.value?.primarySubscriptionId ??
          entitlement.value?.stripeSubscriptionId ??
          null
        }
        subscriptions={managedSubscriptionState.value?.managedSubscriptions ?? []}
      />

      <BillingFeedbackBanner message={status.value} tone={statusTone.value} />
    </div>
  );
});
