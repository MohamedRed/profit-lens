import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { watchEntitlement, watchUsage } from '../../../../lib/features/billing/billing-service';
import type { AuthStore } from '../../../../lib/auth/auth-context';
import type { Entitlement, OfferUsage } from '../../../../lib/types/billing';

export interface OfferEntitlementState {
  entitlement: Signal<Entitlement | null>;
  usage: Signal<OfferUsage | null>;
}

export const resolveRemainingOffers = (
  entitlement: Entitlement | null,
  usage: OfferUsage | null,
): number | null => {
  if (!entitlement || entitlement.offerLimit == null) {
    return null;
  }
  return Math.max(0, entitlement.offerLimit - (usage?.offerCount ?? 0));
};

export const useOfferEntitlement = (auth: AuthStore): OfferEntitlementState => {
  const entitlement = useSignal<Entitlement | null>(null);
  const usage = useSignal<OfferUsage | null>(null);

  useVisibleTask$(({ track, cleanup }) => {
    const isReady = track(() => auth.ready.value);
    const uid = track(() => auth.user.value?.uid ?? '');
    if (!isReady || !uid) {
      entitlement.value = null;
      usage.value = null;
      return;
    }

    let unsubscribeUsage: (() => void) | null = null;
    let usagePeriodKey: string | null = null;
    const unsubscribeEntitlement = watchEntitlement(uid, (nextEntitlement) => {
      entitlement.value = nextEntitlement;
      const nextUsagePeriodKey = nextEntitlement?.periodKey ?? null;
      if (nextUsagePeriodKey === usagePeriodKey) {
        return;
      }
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
    });

    cleanup(() => {
      unsubscribeEntitlement();
      if (unsubscribeUsage) {
        unsubscribeUsage();
      }
    });
  });

  return {
    entitlement,
    usage,
  };
};
