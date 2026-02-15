import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Button } from '../../../../components/ui/button';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import {
  openCustomerPortal,
  startCheckout,
  warmCustomerPortalSession,
  watchEntitlement,
  watchUsage,
} from '../../../../lib/features/billing/billing-service';
import type { Entitlement, OfferUsage } from '../../../../lib/types/billing';
import { billingPlans } from '../../../../lib/config/runtime-config';
import { OfferSectionCard } from './offer-section-card';

interface OfferUsageSectionProps {
  uid: string;
}

const activationDelayMs = 1200;

const resolveStatusLabel = (entitlement: Entitlement, statusUnknown: string): string => {
  const status = entitlement.status.toLowerCase();
  switch (status) {
    case 'free':
      return 'Free';
    case 'active':
      return 'Active';
    case 'past_due':
      return 'Past due';
    case 'canceled':
    case 'cancelled':
      return 'Canceled';
    case 'trialing':
      return 'Trialing';
    case 'incomplete':
    case 'incomplete_expired':
      return 'Incomplete';
    case 'unpaid':
      return 'Unpaid';
    default:
      return statusUnknown;
  }
};

export const OfferUsageSection = component$<OfferUsageSectionProps>(({ uid }) => {
  const i18n = useI18n();
  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);
  const activateStreams = useSignal(false);
  const status = useSignal('');
  const openingPortal = useSignal(false);

  useVisibleTask$(({ track, cleanup }) => {
    const value = track(() => uid);
    if (!value) {
      entitlement.value = null;
      usage.value = null;
      activateStreams.value = false;
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let unsubscribeEntitlement: (() => void) | null = null;
    let unsubscribeUsage: (() => void) | null = null;

    activateStreams.value = false;
    timeoutId = setTimeout(() => {
      activateStreams.value = true;
      unsubscribeEntitlement = watchEntitlement(value, (nextEntitlement) => {
        entitlement.value = nextEntitlement;
        usage.value = null;
        if (nextEntitlement && nextEntitlement.planId.toLowerCase() !== 'free') {
          void warmCustomerPortalSession().catch(() => {
            // Silent prefetch failure; click path still does strict error handling.
          });
        }
        if (unsubscribeUsage) {
          unsubscribeUsage();
          unsubscribeUsage = null;
        }
        if (nextEntitlement?.periodKey) {
          unsubscribeUsage = watchUsage(value, nextEntitlement.periodKey, (nextUsage) => {
            usage.value = nextUsage;
          });
        }
      });
    }, activationDelayMs);

    cleanup(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (unsubscribeEntitlement) {
        unsubscribeEntitlement();
      }
      if (unsubscribeUsage) {
        unsubscribeUsage();
      }
    });
  });

  const content = () => {
    if (!activateStreams.value || !entitlement.value) {
      return <p class="ui-offer-loading-copy">{t(i18n, 'loadingLabel', 'Loading...')}</p>;
    }

    const offerLimit = entitlement.value.offerLimit;
    const used = usage.value?.offerCount ?? 0;
    const remaining = offerLimit == null ? null : Math.max(0, offerLimit - used);
    const remainingText = remaining == null ? null : String(remaining);
    const remainingLabel =
      remaining == null
        ? t(i18n, 'offersRemainingUnlimited', 'Unlimited')
        : formatTemplate(
            t(i18n, 'offersRemainingValue', '{remaining} offers remaining'),
            {
              remaining: remainingText ?? '',
              count: remainingText ?? '',
            },
          );

    const isFree =
      entitlement.value.planId.toLowerCase() === 'free' ||
      entitlement.value.status.toLowerCase() === 'free';
    const paidPlan = billingPlans.find((plan) => plan.offerLimit !== null && Boolean(plan.priceId));

    return (
      <div class="ui-offer-usage-content">
        <p class="ui-offer-usage-value">{remainingLabel}</p>
        <p class="ui-offer-usage-meta">
          {t(i18n, 'subscriptionStatusLabel', 'Subscription status')}:{' '}
          {resolveStatusLabel(entitlement.value, t(i18n, 'subscriptionStatusUnknown', 'Unknown'))}
        </p>
        <div class="ui-offer-usage-actions">
          {isFree ? (
            <Button
              variant="default"
              class="ui-offer-usage-cta"
              onClick$={async () => {
                if (!paidPlan?.priceId) {
                  status.value = t(i18n, 'sourceOpenError', 'Unable to open source.');
                  return;
                }
                status.value = '';
                try {
                  await startCheckout(paidPlan.priceId);
                } catch (error) {
                  status.value = error instanceof Error ? error.message : String(error);
                }
              }}
            >
              {t(i18n, 'upgradePlanButton', 'Upgrade plan')}
            </Button>
          ) : (
            <Button
              variant="default"
              class="ui-offer-usage-cta"
              disabled={openingPortal.value}
              onPointerDown$={() => {
                void warmCustomerPortalSession().catch(() => {
                  // Silent prefetch failure; click path still does strict error handling.
                });
              }}
              onClick$={async () => {
                if (openingPortal.value) {
                  return;
                }
                openingPortal.value = true;
                status.value = '';
                try {
                  await openCustomerPortal({ uid, source: 'offer' });
                } catch (error) {
                  status.value = error instanceof Error ? error.message : String(error);
                  openingPortal.value = false;
                }
              }}
            >
              {openingPortal.value ? t(i18n, 'loadingLabel', 'Loading...') : t(i18n, 'managePlanButton', 'Manage plan')}
            </Button>
          )}
        </div>
        {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
      </div>
    );
  };

  return (
    <OfferSectionCard
      title={t(i18n, 'offersRemainingTitle', 'Offers remaining')}
      showBorder={true}
    >
      {content()}
    </OfferSectionCard>
  );
});
