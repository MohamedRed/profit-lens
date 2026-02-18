import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Button } from '../../../../components/ui/button';
import { OfferUsageSkeleton, SkeletonBlock } from '../../../../components/ui/page-loading-skeleton';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import {
  startCheckout,
  watchEntitlement,
  watchUsage,
} from '../../../../lib/features/billing/billing-service';
import type { Entitlement, OfferUsage } from '../../../../lib/types/billing';
import { billingPlans } from '../../../../lib/config/runtime-config';
import { OfferSectionCard } from './offer-section-card';

interface OfferUsageSectionProps {
  uid: string;
  variant?: 'card' | 'inline';
}

interface OfferUsageCacheEntry {
  entitlement: Entitlement | null;
  usage: OfferUsage | null;
}

const offerUsageCache = new Map<string, OfferUsageCacheEntry>();

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

export const OfferUsageSection = component$<OfferUsageSectionProps>(({ uid, variant = 'card' }) => {
  const i18n = useI18n();
  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);
  const status = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const value = track(() => uid);
    if (!value) {
      entitlement.value = null;
      usage.value = null;
      return;
    }

    const cached = offerUsageCache.get(value);
    if (cached) {
      entitlement.value = cached.entitlement;
      usage.value = cached.usage;
    }

    let unsubscribeUsage: (() => void) | null = null;
    const unsubscribeEntitlement = watchEntitlement(value, (nextEntitlement) => {
      const previousPeriodKey = entitlement.value?.periodKey ?? null;
      const nextPeriodKey = nextEntitlement?.periodKey ?? null;

      entitlement.value = nextEntitlement;
      offerUsageCache.set(value, {
        entitlement: nextEntitlement,
        usage: usage.value,
      });

      if (unsubscribeUsage) {
        unsubscribeUsage();
        unsubscribeUsage = null;
      }

      if (nextPeriodKey && nextPeriodKey !== previousPeriodKey) {
        usage.value = null;
      }

      if (nextPeriodKey) {
        unsubscribeUsage = watchUsage(value, nextPeriodKey, (nextUsage) => {
          usage.value = nextUsage;
          offerUsageCache.set(value, {
            entitlement: entitlement.value,
            usage: nextUsage,
          });
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

  const content = () => {
    if (!entitlement.value) {
      if (variant === 'inline') {
        return (
          <div class="ui-offer-usage-inline ui-skeleton-stack-sm" aria-hidden="true">
            <SkeletonBlock height="12px" width="124px" />
            <SkeletonBlock height="14px" width="176px" />
          </div>
        );
      }
      return <OfferUsageSkeleton />;
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

    const statusLabel = resolveStatusLabel(
      entitlement.value,
      t(i18n, 'subscriptionStatusUnknown', 'Unknown'),
    );

    const action = isFree ? (
      <button
        type="button"
        class="ui-offer-usage-inline-link"
        onClick$={async () => {
          if (!paidPlan?.priceId) {
            status.value = t(
              i18n,
              'errorPlanUnavailable',
              'No paid plan is available right now. Please try again later.',
            );
            return;
          }
          status.value = '';
          try {
            await startCheckout(paidPlan.priceId);
          } catch (error) {
            status.value = resolveUserFacingErrorMessage(i18n, error, 'billing');
          }
        }}
      >
        {t(i18n, 'upgradePlanButton', 'Upgrade plan')}
      </button>
    ) : (
      <Link href="/next/app/settings/billing" prefetch={true} class="ui-offer-usage-inline-link">
        {t(i18n, 'managePlanButton', 'Manage plan')}
      </Link>
    );

    if (variant === 'inline') {
      return (
        <div class="ui-offer-usage-inline">
          <div class="ui-offer-usage-inline-copy">
            <p class="ui-offer-usage-inline-title">{t(i18n, 'offersRemainingTitle', 'Offers remaining')}</p>
            <p class="ui-offer-usage-inline-value">
              {remainingLabel}
              <span class="ui-offer-usage-inline-separator">·</span>
              <span>{statusLabel}</span>
            </p>
          </div>
          {action}
          {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
        </div>
      );
    }

    return (
      <div class="ui-offer-usage-content">
        <p class="ui-offer-usage-value">{remainingLabel}</p>
        <p class="ui-offer-usage-meta">
          {t(i18n, 'subscriptionStatusLabel', 'Subscription status')}: {statusLabel}
        </p>
        <div class="ui-offer-usage-actions">
          {isFree ? (
            <Button
              variant="default"
              class="ui-offer-usage-cta"
              onClick$={async () => {
                if (!paidPlan?.priceId) {
                  status.value = t(
                    i18n,
                    'errorPlanUnavailable',
                    'No paid plan is available right now. Please try again later.',
                  );
                  return;
                }
                status.value = '';
                try {
                  await startCheckout(paidPlan.priceId);
                } catch (error) {
                  status.value = resolveUserFacingErrorMessage(i18n, error, 'billing');
                }
              }}
            >
              {t(i18n, 'upgradePlanButton', 'Upgrade plan')}
            </Button>
          ) : (
            <Link
              href="/next/app/settings/billing"
              prefetch={true}
              class="ui-button ui-button-default ui-button-md ui-offer-usage-cta"
            >
              {t(i18n, 'managePlanButton', 'Manage plan')}
            </Link>
          )}
        </div>
        {status.value ? <p class="ui-status ui-status-error">{status.value}</p> : null}
      </div>
    );
  };

  if (variant === 'inline') {
    return <section class="ui-offer-usage-inline-shell">{content()}</section>;
  }

  return (
    <OfferSectionCard
      title={t(i18n, 'offersRemainingTitle', 'Offers remaining')}
      showBorder={true}
    >
      {content()}
    </OfferSectionCard>
  );
});
