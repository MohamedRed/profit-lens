import { describe, expect, it } from 'vitest';
import { shouldAttemptStripeEntitlementRepair } from './entitlement-repair';
import type { Entitlement } from '../../types/billing';

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

describe('entitlement-repair', () => {
  it('returns false when entitlement is missing', () => {
    expect(shouldAttemptStripeEntitlementRepair(null)).toBe(false);
  });

  it('returns false for non-free plan ids', () => {
    expect(shouldAttemptStripeEntitlementRepair(buildEntitlement({ planId: 'tier_24' }))).toBe(false);
  });

  it('returns false for free plans with no Stripe linkage', () => {
    expect(shouldAttemptStripeEntitlementRepair(buildEntitlement())).toBe(false);
  });

  it('returns true when free plan still has a Stripe customer id', () => {
    expect(
      shouldAttemptStripeEntitlementRepair(buildEntitlement({ stripeCustomerId: 'cus_123' })),
    ).toBe(true);
  });

  it('returns true when free plan still has a Stripe subscription id', () => {
    expect(
      shouldAttemptStripeEntitlementRepair(buildEntitlement({ stripeSubscriptionId: 'sub_123' })),
    ).toBe(true);
  });
});
