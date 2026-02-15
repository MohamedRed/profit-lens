import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callCreateCustomerPortalSession } from '../../firebase/callables';
import {
  __resetCustomerPortalSessionCacheForTests,
  consumeCustomerPortalSessionUrl,
  prefetchCustomerPortalSession,
} from './customer-portal-session';

vi.mock('../../firebase/callables', () => ({
  callCreateCustomerPortalSession: vi.fn(),
}));

describe('customer-portal-session', () => {
  beforeEach(() => {
    __resetCustomerPortalSessionCacheForTests();
    vi.clearAllMocks();
    vi.stubGlobal('location', { origin: 'https://profit-lens-prod-2e417.web.app' });
  });

  it('reuses a prefetched URL for the next open', async () => {
    const callable = vi.mocked(callCreateCustomerPortalSession);
    callable.mockResolvedValue({ url: 'https://billing.stripe.com/p/session_1' });

    await prefetchCustomerPortalSession();
    const url = await consumeCustomerPortalSessionUrl();

    expect(url).toBe('https://billing.stripe.com/p/session_1');
    expect(callable).toHaveBeenCalledTimes(1);
  });

  it('fetches a new session after the cached one is consumed', async () => {
    const callable = vi.mocked(callCreateCustomerPortalSession);
    callable
      .mockResolvedValueOnce({ url: 'https://billing.stripe.com/p/session_1' })
      .mockResolvedValueOnce({ url: 'https://billing.stripe.com/p/session_2' });

    await prefetchCustomerPortalSession();
    const first = await consumeCustomerPortalSessionUrl();
    const second = await consumeCustomerPortalSessionUrl();

    expect(first).toBe('https://billing.stripe.com/p/session_1');
    expect(second).toBe('https://billing.stripe.com/p/session_2');
    expect(callable).toHaveBeenCalledTimes(2);
  });

  it('deduplicates concurrent prefetch requests', async () => {
    const callable = vi.mocked(callCreateCustomerPortalSession);
    callable.mockResolvedValue({ url: 'https://billing.stripe.com/p/session_1' });

    await Promise.all([prefetchCustomerPortalSession(), prefetchCustomerPortalSession()]);

    expect(callable).toHaveBeenCalledTimes(1);
  });
});
