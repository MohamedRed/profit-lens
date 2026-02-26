import type { Entitlement } from '../../../../lib/types/billing';

export interface OngoingSubscriptionsRedirectInput {
  entitlement: Entitlement | null;
  isManagedStateLoading: boolean;
  managedSubscriptionCount: number | null;
  uid: string | null;
}

const isFreeEntitlement = (entitlement: Entitlement | null): boolean => {
  if (!entitlement) {
    return true;
  }
  return (
    entitlement.planId.trim().toLowerCase() === 'free' ||
    entitlement.status.trim().toLowerCase() === 'free'
  );
};

export const shouldRedirectFromOngoingSubscriptionsDetail = (
  input: OngoingSubscriptionsRedirectInput,
): boolean => {
  if (!input.uid) {
    return true;
  }
  if (isFreeEntitlement(input.entitlement)) {
    return true;
  }
  if (input.isManagedStateLoading) {
    return false;
  }
  if (input.managedSubscriptionCount == null) {
    return false;
  }
  return input.managedSubscriptionCount <= 1;
};
