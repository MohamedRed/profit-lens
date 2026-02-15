import { describe, expect, it } from 'vitest';
import { billingPlans, firebaseFunctionsRegion } from './runtime-config';

describe('runtime-config', () => {
  it('uses the expected Firebase region', () => {
    expect(firebaseFunctionsRegion).toBe('europe-west1');
  });

  it('defines all billing tiers', () => {
    expect(billingPlans.map((plan) => plan.id)).toEqual(['tier_9', 'tier_24', 'tier_34']);
  });

  it('defines Stripe price ids for all billing tiers', () => {
    expect(billingPlans.every((plan) => plan.priceId.length > 0)).toBe(true);
  });
});
