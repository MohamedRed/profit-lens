import type { Entitlement } from '../../types/billing';

export const shouldAttemptStripeEntitlementRepair = (entitlement: Entitlement | null): boolean => {
  if (!entitlement) {
    return false;
  }
  if (entitlement.planId.trim().toLowerCase() !== 'free') {
    return false;
  }
  return Boolean(entitlement.stripeCustomerId || entitlement.stripeSubscriptionId);
};
