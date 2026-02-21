import { billingPlans } from '../../../../lib/config/runtime-config';
import type { Entitlement } from '../../../../lib/types/billing';

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
