import { fetchEntitlement, fetchUsage } from '../../../lib/features/billing/billing-service';

export interface OfferLimitAvailability {
  withinLimit: boolean;
  remainingOffers: number | null;
}

export const checkOfferLimitAvailability = async (uid: string): Promise<OfferLimitAvailability> => {
  try {
    const entitlement = await fetchEntitlement(uid);
    if (!entitlement || entitlement.offerLimit == null) {
      return {
        withinLimit: true,
        remainingOffers: null,
      };
    }

    const usage = await fetchUsage(uid, entitlement.periodKey);
    const used = usage?.offerCount ?? 0;
    const remainingOffers = Math.max(0, entitlement.offerLimit - used);
    return {
      withinLimit: used < entitlement.offerLimit,
      remainingOffers,
    };
  } catch {
    return {
      withinLimit: true,
      remainingOffers: null,
    };
  }
};
