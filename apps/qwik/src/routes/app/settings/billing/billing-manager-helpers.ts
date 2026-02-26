import { billingPlans } from '../../../../lib/config/runtime-config';
import {
  resolveDefaultPlanPriceId,
  resolveSelectedPriceId,
} from '../../../../lib/features/billing/plan-resolution';
import type { ManagedSubscriptionSnapshot } from '../../../../lib/types/billing';

export const formatDate = (locale: string, date: Date): string => {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export { resolveDefaultPlanPriceId, resolveSelectedPriceId };

export const resolvePlanLabelFromSubscription = (subscription: ManagedSubscriptionSnapshot): string => {
  const byPriceId = billingPlans.find((plan) => plan.priceId === subscription.currentPriceId);
  if (byPriceId) {
    return byPriceId.priceLabel;
  }
  const byPlanId = billingPlans.find((plan) => plan.id === subscription.currentPlanId);
  if (byPlanId) {
    return byPlanId.priceLabel;
  }
  const normalizedPlanId = subscription.currentPlanId.replace(/_/g, ' ').trim();
  return normalizedPlanId.length > 0 ? normalizedPlanId : subscription.currentPriceId;
};
