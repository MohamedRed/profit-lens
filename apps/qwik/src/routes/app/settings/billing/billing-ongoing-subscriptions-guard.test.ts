import { describe, expect, it } from 'vitest';
import type { Entitlement } from '../../../../lib/types/billing';
import { shouldRedirectFromOngoingSubscriptionsDetail } from './billing-ongoing-subscriptions-guard';

const paidEntitlement: Entitlement = {
  planId: 'pro',
  status: 'active',
  offerLimit: 1000,
  deviceLimit: 1,
  periodStart: new Date('2026-01-01T00:00:00.000Z'),
  periodEnd: new Date('2026-02-01T00:00:00.000Z'),
  periodKey: '2026-01',
  cancelAtPeriodEnd: false,
  stripeCustomerId: 'cus_123',
  stripePriceId: 'price_123',
  stripeSubscriptionId: 'sub_123',
};

describe('shouldRedirectFromOngoingSubscriptionsDetail', () => {
  it('redirects when the user is unauthenticated', () => {
    expect(
      shouldRedirectFromOngoingSubscriptionsDetail({
        uid: null,
        entitlement: paidEntitlement,
        isManagedStateLoading: false,
        managedSubscriptionCount: 2,
      }),
    ).toBe(true);
  });

  it('redirects for free entitlement', () => {
    expect(
      shouldRedirectFromOngoingSubscriptionsDetail({
        uid: 'uid_123',
        entitlement: { ...paidEntitlement, planId: 'free', status: 'free' },
        isManagedStateLoading: false,
        managedSubscriptionCount: 2,
      }),
    ).toBe(true);
  });

  it('does not redirect while managed state is still loading', () => {
    expect(
      shouldRedirectFromOngoingSubscriptionsDetail({
        uid: 'uid_123',
        entitlement: paidEntitlement,
        isManagedStateLoading: true,
        managedSubscriptionCount: null,
      }),
    ).toBe(false);
  });

  it('redirects when managed subscription count is zero or one after loading', () => {
    expect(
      shouldRedirectFromOngoingSubscriptionsDetail({
        uid: 'uid_123',
        entitlement: paidEntitlement,
        isManagedStateLoading: false,
        managedSubscriptionCount: 0,
      }),
    ).toBe(true);

    expect(
      shouldRedirectFromOngoingSubscriptionsDetail({
        uid: 'uid_123',
        entitlement: paidEntitlement,
        isManagedStateLoading: false,
        managedSubscriptionCount: 1,
      }),
    ).toBe(true);
  });

  it('does not redirect when managed subscription count is two or more', () => {
    expect(
      shouldRedirectFromOngoingSubscriptionsDetail({
        uid: 'uid_123',
        entitlement: paidEntitlement,
        isManagedStateLoading: false,
        managedSubscriptionCount: 2,
      }),
    ).toBe(false);
  });
});
