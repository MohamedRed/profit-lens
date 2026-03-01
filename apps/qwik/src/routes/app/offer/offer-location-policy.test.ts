import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OfferCurrentLocation } from '../../../lib/types/offer';
import {
  FAST_MAX_AGE_MS,
  FAST_TIMEOUT_MS,
  PRECISE_TIMEOUT_MS,
  clearOfferLocationCacheForTest,
  prefetchOfferCurrentLocationWithPolicy,
  readOfferCurrentLocationWithPolicy,
} from './offer-location-policy';

const fastOptions: PositionOptions = {
  enableHighAccuracy: false,
  timeout: FAST_TIMEOUT_MS,
  maximumAge: FAST_MAX_AGE_MS,
};

const preciseOptions: PositionOptions = {
  enableHighAccuracy: true,
  timeout: PRECISE_TIMEOUT_MS,
  maximumAge: 0,
};

describe('offer-location-policy', () => {
  beforeEach(() => {
    clearOfferLocationCacheForTest();
  });

  it('returns cached location when cache is fresh', async () => {
    const fastLocation: OfferCurrentLocation = { lat: 33.5731, lng: -7.5898 };
    const readCurrentLocation = vi.fn().mockResolvedValue(fastLocation);

    await readOfferCurrentLocationWithPolicy({
      readCurrentLocation,
      nowMs: () => 10,
    });

    readCurrentLocation.mockReset();
    const cached = await readOfferCurrentLocationWithPolicy({
      readCurrentLocation,
      nowMs: () => 100,
    });

    expect(cached).toEqual(fastLocation);
    expect(readCurrentLocation).not.toHaveBeenCalled();
  });

  it('uses fast path without precise fallback when fast read succeeds', async () => {
    const fastLocation: OfferCurrentLocation = { lat: 34.0209, lng: -6.8416 };
    const readCurrentLocation = vi.fn().mockResolvedValue(fastLocation);

    const result = await readOfferCurrentLocationWithPolicy({
      readCurrentLocation,
      nowMs: () => 50,
    });

    expect(result).toEqual(fastLocation);
    expect(readCurrentLocation).toHaveBeenCalledTimes(1);
    expect(readCurrentLocation).toHaveBeenCalledWith(fastOptions);
  });

  it('falls back to precise read when fast read times out', async () => {
    const preciseLocation: OfferCurrentLocation = { lat: 31.7917, lng: -7.0926 };
    const readCurrentLocation = vi
      .fn()
      .mockRejectedValueOnce({ code: 'timeout' })
      .mockResolvedValueOnce(preciseLocation);

    const result = await readOfferCurrentLocationWithPolicy({
      readCurrentLocation,
      nowMs: () => 100,
    });

    expect(result).toEqual(preciseLocation);
    expect(readCurrentLocation).toHaveBeenCalledTimes(2);
    expect(readCurrentLocation).toHaveBeenNthCalledWith(1, fastOptions);
    expect(readCurrentLocation).toHaveBeenNthCalledWith(2, preciseOptions);
  });

  it('fails immediately on permission-denied without precise fallback', async () => {
    const permissionError = { code: 'permission-denied' };
    const readCurrentLocation = vi.fn().mockRejectedValue(permissionError);

    await expect(
      readOfferCurrentLocationWithPolicy({
        readCurrentLocation,
        nowMs: () => 100,
      }),
    ).rejects.toBe(permissionError);

    expect(readCurrentLocation).toHaveBeenCalledTimes(1);
    expect(readCurrentLocation).toHaveBeenCalledWith(fastOptions);
  });

  it('prefetch swallows location errors', async () => {
    const readCurrentLocation = vi.fn().mockRejectedValue({ code: 'unsupported' });

    await expect(
      prefetchOfferCurrentLocationWithPolicy({
        readCurrentLocation,
        nowMs: () => 100,
      }),
    ).resolves.toBeUndefined();
  });
});
