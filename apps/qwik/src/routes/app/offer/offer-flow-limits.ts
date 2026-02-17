import { fetchEntitlement, fetchUsage } from '../../../lib/features/billing/billing-service';

export const ensureWithinOfferLimit = async (uid: string): Promise<boolean> => {
  try {
    const entitlement = await fetchEntitlement(uid);
    if (!entitlement || entitlement.offerLimit == null) {
      return true;
    }

    const usage = await fetchUsage(uid, entitlement.periodKey);
    const used = usage?.offerCount ?? 0;
    return used < entitlement.offerLimit;
  } catch {
    return true;
  }
};
