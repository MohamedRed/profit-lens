import { describe, expect, it } from 'vitest';
import { billingPlans } from '../../config/runtime-config';
import type { Entitlement } from '../../types/billing';
import {
  resolveBillingPlanForEntitlement,
  resolveDefaultPlanPriceId,
  resolvePlanLabelFromEntitlement,
  resolveSelectedPriceId,
} from './plan-resolution';

const buildEntitlement = (overrides: Partial<Entitlement> = {}): Entitlement => {
  return {
    planId: 'free',
    status: 'free',
    offerLimit: 10,
    deviceLimit: 1,
    periodStart: new Date('2026-01-01T00:00:00.000Z'),
    periodEnd: new Date('2026-02-01T00:00:00.000Z'),
    periodKey: '2026-01',
    cancelAtPeriodEnd: false,
    stripeCustomerId: null,
    stripePriceId: null,
    stripeSubscriptionId: null,
    ...overrides,
  };
};

describe('plan-resolution', () => {
  const tier9Plan = billingPlans.find((plan) => plan.id === 'tier_9');
  const tier24Plan = billingPlans.find((plan) => plan.id === 'tier_24');
  const tier34Plan = billingPlans.find((plan) => plan.id === 'tier_34');

  it('returns default selected price for free entitlement', () => {
    const entitlement = buildEntitlement();
    expect(resolveSelectedPriceId(entitlement)).toBe(resolveDefaultPlanPriceId());
    expect(resolvePlanLabelFromEntitlement(entitlement)).toBeNull();
    expect(resolveBillingPlanForEntitlement(entitlement)).toBeNull();
  });

  it('prefers stripePriceId when resolving paid plan', () => {
    expect(tier24Plan?.priceId).toBeTruthy();
    const entitlement = buildEntitlement({
      planId: 'tier_9',
      status: 'active',
      offerLimit: 250,
      stripePriceId: tier24Plan?.priceId ?? null,
    });
    expect(resolveSelectedPriceId(entitlement)).toBe(tier24Plan?.priceId ?? '');
    expect(resolvePlanLabelFromEntitlement(entitlement)).toBe(tier24Plan?.priceLabel ?? null);
  });

  it('falls back to planId when stripePriceId is missing', () => {
    expect(tier34Plan?.priceId).toBeTruthy();
    const entitlement = buildEntitlement({
      planId: 'tier_34',
      status: 'active',
      offerLimit: null,
      stripePriceId: null,
    });
    expect(resolveSelectedPriceId(entitlement)).toBe(tier34Plan?.priceId ?? '');
    expect(resolvePlanLabelFromEntitlement(entitlement)).toBe(tier34Plan?.priceLabel ?? null);
  });

  it('falls back to offerLimit when plan linkage is incomplete', () => {
    expect(tier24Plan?.priceId).toBeTruthy();
    const entitlement = buildEntitlement({
      planId: 'unknown_plan',
      status: 'active',
      offerLimit: 1000,
      stripePriceId: null,
    });
    expect(resolveSelectedPriceId(entitlement)).toBe(tier24Plan?.priceId ?? '');
    expect(resolvePlanLabelFromEntitlement(entitlement)).toBe(tier24Plan?.priceLabel ?? null);
  });

  it('returns default selection but no label for unknown paid entitlement', () => {
    expect(tier9Plan?.priceId).toBeTruthy();
    const entitlement = buildEntitlement({
      planId: 'unknown_plan',
      status: 'active',
      offerLimit: 123,
      stripePriceId: 'price_unknown',
    });
    expect(resolveSelectedPriceId(entitlement)).toBe(resolveDefaultPlanPriceId());
    expect(resolvePlanLabelFromEntitlement(entitlement)).toBeNull();
    expect(resolveBillingPlanForEntitlement(entitlement)).toBeNull();
  });
});
