import { beforeEach, describe, expect, it, vi } from 'vitest';

const callCheckSubscriptionEligibility = vi.fn();
const callCreateCheckoutSession = vi.fn();
const callCreateCustomerPortalSession = vi.fn();

vi.mock('../../firebase/callables', () => ({
  callCheckSubscriptionEligibility,
  callCreateCheckoutSession,
  callCreateCustomerPortalSession,
  callChangeSubscriptionPlan: vi.fn(),
  callGetManagedSubscriptionState: vi.fn(),
  callSetSubscriptionCancellation: vi.fn(),
}));

describe('billing service checkout guard', () => {
  beforeEach(() => {
    callCheckSubscriptionEligibility.mockReset();
    callCreateCheckoutSession.mockReset();
    callCreateCustomerPortalSession.mockReset();
    const assign = vi.fn();
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          origin: 'https://app.profitlens.test',
          assign,
        },
      },
      configurable: true,
      writable: true,
    });
  });

  it('opens billing portal when preflight finds an existing manageable subscription', async () => {
    callCheckSubscriptionEligibility.mockResolvedValue({
      eligibleForCheckout: false,
      manageableSubscriptionCount: 1,
      duplicateSubscriptionCount: 0,
      primarySubscriptionId: 'sub_123',
    });
    callCreateCustomerPortalSession.mockResolvedValue({
      url: 'https://billing.stripe.com/session',
    });
    callCreateCheckoutSession.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay',
    });
    const { startCheckout } = await import('./billing-service');
    await startCheckout('price_123');
    expect(callCreateCustomerPortalSession).toHaveBeenCalledWith({
      origin: 'https://app.profitlens.test',
    });
    expect(callCreateCheckoutSession).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith('https://billing.stripe.com/session');
  });

  it('creates checkout session when preflight confirms eligibility', async () => {
    callCheckSubscriptionEligibility.mockResolvedValue({
      eligibleForCheckout: true,
      manageableSubscriptionCount: 0,
      duplicateSubscriptionCount: 0,
      primarySubscriptionId: null,
    });
    callCreateCheckoutSession.mockResolvedValue({
      url: 'https://checkout.stripe.com/pay',
    });
    const { startCheckout } = await import('./billing-service');
    await startCheckout('price_123');
    expect(callCreateCheckoutSession).toHaveBeenCalledWith({
      priceId: 'price_123',
      origin: 'https://app.profitlens.test',
    });
    expect(callCreateCustomerPortalSession).not.toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith('https://checkout.stripe.com/pay');
  });
});
