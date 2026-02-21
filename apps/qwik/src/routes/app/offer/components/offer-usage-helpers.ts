import type { Entitlement, OfferUsage } from '../../../../lib/types/billing';

export interface OfferUsageCacheEntry {
  entitlement: Entitlement | null;
  usage: OfferUsage | null;
}

export const offerUsageCache = new Map<string, OfferUsageCacheEntry>();

export const resolveStatusLabel = (
  entitlement: Entitlement,
  statusUnknown: string,
): string => {
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
