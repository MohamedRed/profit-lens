import { component$, type QRL, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { resolvePlanLabelFromEntitlement } from '../../../../lib/features/billing/plan-resolution';
import { watchEntitlement, watchUsage } from '../../../../lib/features/billing/billing-service';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { Entitlement, OfferUsage } from '../../../../lib/types/billing';

interface OfferSubscriptionLinkProps {
  onOpenBilling$: QRL<() => void>;
  uid: string;
}

const normalize = (value: string | null | undefined): string => {
  return String(value ?? '').trim().toLowerCase();
};

const resolvePlanSummary = (params: {
  entitlement: Entitlement | null;
  i18n: ReturnType<typeof useI18n>;
}): string => {
  const { entitlement, i18n } = params;
  if (!entitlement) {
    return t(i18n, 'offerSubscriptionSettingsHint', 'Open your current plan and billing options.');
  }
  const isFree =
    normalize(entitlement.planId) === 'free' || normalize(entitlement.status) === 'free';
  const planLabel = isFree
    ? t(i18n, 'subscriptionFreeTitle', 'Free plan')
    : resolvePlanLabelFromEntitlement(entitlement) ?? t(i18n, 'subscriptionStatusUnknown', 'Unknown');
  return formatTemplate(t(i18n, 'subscriptionActivePlan', 'Current plan: {price}'), {
    price: planLabel,
  });
};

const resolveUsageSummary = (params: {
  entitlement: Entitlement | null;
  usage: OfferUsage | null;
  i18n: ReturnType<typeof useI18n>;
}): string => {
  const { entitlement, usage, i18n } = params;
  if (!entitlement) {
    return '';
  }
  if (entitlement.offerLimit == null) {
    return t(i18n, 'offersRemainingUnlimited', 'Unlimited offers');
  }
  const remainingOffers = Math.max(0, entitlement.offerLimit - (usage?.offerCount ?? 0));
  return formatTemplate(t(i18n, 'offersRemainingValue', '{remaining} offers remaining this month'), {
    remaining: String(remainingOffers),
    count: String(remainingOffers),
  });
};

export const OfferSubscriptionLink = component$<OfferSubscriptionLinkProps>((props) => {
  const i18n = useI18n();
  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);

  useVisibleTask$(({ track, cleanup }) => {
    const uid = track(() => props.uid);
    if (!uid) {
      entitlement.value = null;
      usage.value = null;
      return;
    }

    let unsubscribeUsage: (() => void) | null = null;
    const unsubscribeEntitlement = watchEntitlement(uid, (nextEntitlement) => {
      entitlement.value = nextEntitlement;
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

  const primarySummary = resolvePlanSummary({ entitlement: entitlement.value, i18n });
  const usageSummary = resolveUsageSummary({ entitlement: entitlement.value, usage: usage.value, i18n });

  return (
    <button type="button" class="ui-offer-settings-link" onClick$={props.onOpenBilling$}>
      <div class="ui-offer-settings-link-copy">
        <p class="ui-offer-settings-link-title">{t(i18n, 'billingManageTitle', 'Manage subscription')}</p>
        <p class="ui-offer-settings-link-subtitle">{primarySummary}</p>
        {usageSummary ? <p class="ui-offer-settings-link-subtitle">{usageSummary}</p> : null}
      </div>
      <span class="material-icons-outlined ui-offer-settings-link-chevron" aria-hidden="true">
        chevron_right
      </span>
    </button>
  );
});
