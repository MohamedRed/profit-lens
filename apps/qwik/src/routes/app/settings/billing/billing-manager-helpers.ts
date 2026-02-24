import { billingPlans } from '../../../../lib/config/runtime-config';
import type { Entitlement, ManagedSubscriptionSnapshot } from '../../../../lib/types/billing';

export const formatDate = (locale: string, date: Date): string => {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const resolveDefaultPlanPriceId = (): string => {
  return billingPlans.find((plan) => Boolean(plan.priceId))?.priceId ?? '';
};

export const resolveSelectedPriceId = (entitlement: Entitlement | null): string => {
  if (!entitlement) {
    return '';
  }
  const normalizedPlanId = entitlement.planId.trim().toLowerCase();
  const normalizedStatus = entitlement.status.trim().toLowerCase();
  const isFreeEntitlement = normalizedPlanId === 'free' || normalizedStatus === 'free';
  if (isFreeEntitlement) {
    return resolveDefaultPlanPriceId();
  }
  if (
    entitlement.stripePriceId &&
    billingPlans.some((plan) => plan.priceId === entitlement.stripePriceId)
  ) {
    return entitlement.stripePriceId;
  }
  const byPlanId = billingPlans.find((plan) => plan.id === entitlement.planId);
  if (byPlanId?.priceId) {
    return byPlanId.priceId;
  }
  const byOfferLimit = billingPlans.find(
    (plan) => plan.offerLimit === entitlement.offerLimit && Boolean(plan.priceId),
  );
  if (byOfferLimit?.priceId) {
    return byOfferLimit.priceId;
  }
  return resolveDefaultPlanPriceId();
};

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
