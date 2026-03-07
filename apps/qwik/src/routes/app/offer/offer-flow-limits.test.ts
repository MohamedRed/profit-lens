import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkOfferLimitAvailability } from './offer-flow-limits';
import type { Entitlement, OfferUsage } from '../../../lib/types/billing';

const { fetchEntitlementMock, fetchUsageMock } = vi.hoisted(() => {
  return {
    fetchEntitlementMock: vi.fn<(uid: string) => Promise<Entitlement | null>>(),
    fetchUsageMock: vi.fn<(uid: string, periodKey: string) => Promise<OfferUsage | null>>(),
  };
});

vi.mock('../../../lib/features/billing/billing-service', () => {
  return {
    fetchEntitlement: fetchEntitlementMock,
    fetchUsage: fetchUsageMock,
  };
});

const entitlement = (offerLimit: number | null): Entitlement => ({
  planId: 'pro',
  status: 'active',
  offerLimit,
  deviceLimit: 1,
  periodStart: new Date('2026-02-01T00:00:00.000Z'),
  periodEnd: new Date('2026-02-28T23:59:59.999Z'),
  periodKey: '2026-02',
  cancelAtPeriodEnd: false,
  stripePriceId: 'price_test',
});

describe('offer-flow-limits', () => {
  beforeEach(() => {
    fetchEntitlementMock.mockReset();
    fetchUsageMock.mockReset();
  });

  it('allows import when entitlement is missing', async () => {
    fetchEntitlementMock.mockResolvedValueOnce(null);

    await expect(checkOfferLimitAvailability('uid_1')).resolves.toEqual({
      withinLimit: true,
      remainingOffers: null,
    });
    expect(fetchUsageMock).not.toHaveBeenCalled();
  });

  it('allows import for unlimited plans', async () => {
    fetchEntitlementMock.mockResolvedValueOnce(entitlement(null));

    await expect(checkOfferLimitAvailability('uid_1')).resolves.toEqual({
      withinLimit: true,
      remainingOffers: null,
    });
    expect(fetchUsageMock).not.toHaveBeenCalled();
  });

  it('blocks import when usage reached the offer limit', async () => {
    fetchEntitlementMock.mockResolvedValueOnce(entitlement(250));
    fetchUsageMock.mockResolvedValueOnce({
      offerCount: 250,
      periodStart: new Date('2026-02-01T00:00:00.000Z'),
      periodEnd: new Date('2026-02-28T23:59:59.999Z'),
    });

    await expect(checkOfferLimitAvailability('uid_1')).resolves.toEqual({
      withinLimit: false,
      remainingOffers: 0,
    });
  });

  it('allows import when usage is below offer limit', async () => {
    fetchEntitlementMock.mockResolvedValueOnce(entitlement(250));
    fetchUsageMock.mockResolvedValueOnce({
      offerCount: 120,
      periodStart: new Date('2026-02-01T00:00:00.000Z'),
      periodEnd: new Date('2026-02-28T23:59:59.999Z'),
    });

    await expect(checkOfferLimitAvailability('uid_1')).resolves.toEqual({
      withinLimit: true,
      remainingOffers: 130,
    });
  });

  it('fails open when billing fetch errors', async () => {
    fetchEntitlementMock.mockRejectedValueOnce(new Error('network'));

    await expect(checkOfferLimitAvailability('uid_1')).resolves.toEqual({
      withinLimit: true,
      remainingOffers: null,
    });
  });
});
