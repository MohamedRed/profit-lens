import { billingPlans } from '../../config/runtime-config';
import type { BillingPlan, Entitlement } from '../../types/billing';

const normalize = (value: string | null | undefined): string => {
  return (value ?? '').trim().toLowerCase();
};

const isFreeEntitlement = (entitlement: Entitlement | null): boolean => {
  if (!entitlement) {
    return true;
  }
  return normalize(entitlement.planId) === 'free' || normalize(entitlement.status) === 'free';
};

const findByPriceId = (priceId: string | null | undefined): BillingPlan | null => {
  if (!priceId) {
    return null;
  }
  return billingPlans.find((plan) => plan.priceId === priceId) ?? null;
};

const findByPlanId = (planId: string | null | undefined): BillingPlan | null => {
  const normalizedPlanId = normalize(planId);
  if (!normalizedPlanId) {
    return null;
  }
  return billingPlans.find((plan) => normalize(plan.id) === normalizedPlanId) ?? null;
};

const findByOfferLimit = (offerLimit: number | null | undefined): BillingPlan | null => {
  if (offerLimit === undefined) {
    return null;
  }
  return billingPlans.find((plan) => plan.offerLimit === offerLimit && Boolean(plan.priceId)) ?? null;
};

export const resolveDefaultPlanPriceId = (): string => {
  return billingPlans.find((plan) => Boolean(plan.priceId))?.priceId ?? '';
};

export const resolveBillingPlanForEntitlement = (entitlement: Entitlement | null): BillingPlan | null => {
  if (isFreeEntitlement(entitlement)) {
    return null;
  }
  return (
    findByPriceId(entitlement?.stripePriceId) ??
    findByPlanId(entitlement?.planId) ??
    findByOfferLimit(entitlement?.offerLimit)
  );
};

export const resolveSelectedPriceId = (entitlement: Entitlement | null): string => {
  if (isFreeEntitlement(entitlement)) {
    return resolveDefaultPlanPriceId();
  }
  return resolveBillingPlanForEntitlement(entitlement)?.priceId ?? resolveDefaultPlanPriceId();
};

export const resolvePlanLabelFromEntitlement = (entitlement: Entitlement | null): string | null => {
  return resolveBillingPlanForEntitlement(entitlement)?.priceLabel ?? null;
};
