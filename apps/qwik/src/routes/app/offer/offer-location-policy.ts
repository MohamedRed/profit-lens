import type { OfferCurrentLocation } from '../../../lib/types/offer';

export const FAST_TIMEOUT_MS = 2000;
export const FAST_MAX_AGE_MS = 120000;
export const PRECISE_TIMEOUT_MS = 8000;
export const SUBMIT_CACHE_FRESHNESS_MS = 60000;

export type OfferLocationPolicyErrorCode =
  | 'unsupported'
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'unknown';

interface OfferLocationPolicyError {
  code: OfferLocationPolicyErrorCode;
}

interface CachedOfferLocation {
  cachedAtMs: number;
  location: OfferCurrentLocation;
}

interface ReadOfferCurrentLocationWithPolicyParams {
  nowMs?: () => number;
  preferCachedWithinMs?: number;
  readCurrentLocation: (options: PositionOptions) => Promise<OfferCurrentLocation>;
}

let cachedOfferLocation: CachedOfferLocation | null = null;

const isOfferLocationPolicyError = (
  value: unknown,
): value is OfferLocationPolicyError => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const code = (value as { code?: unknown }).code;
  return (
    code === 'unsupported' ||
    code === 'permission-denied' ||
    code === 'position-unavailable' ||
    code === 'timeout' ||
    code === 'unknown'
  );
};

const isRecoverableErrorCode = (code: OfferLocationPolicyErrorCode): boolean => {
  return code === 'timeout' || code === 'position-unavailable' || code === 'unknown';
};

const isValidLocation = (value: OfferCurrentLocation): boolean => {
  return Number.isFinite(value.lat) && Number.isFinite(value.lng);
};

const readCachedLocation = (maxAgeMs: number, nowMs: number): OfferCurrentLocation | null => {
  if (!cachedOfferLocation) {
    return null;
  }
  if (maxAgeMs < 0) {
    return null;
  }
  if (nowMs - cachedOfferLocation.cachedAtMs > maxAgeMs) {
    return null;
  }
  return cachedOfferLocation.location;
};

const cacheLocation = (location: OfferCurrentLocation, nowMs: number): void => {
  if (!isValidLocation(location)) {
    return;
  }
  cachedOfferLocation = {
    location,
    cachedAtMs: nowMs,
  };
};

export const readOfferCurrentLocationWithPolicy = async (
  params: ReadOfferCurrentLocationWithPolicyParams,
): Promise<OfferCurrentLocation> => {
  const now = params.nowMs ?? Date.now;
  const nowMs = now();
  const cacheFreshnessMs = params.preferCachedWithinMs ?? SUBMIT_CACHE_FRESHNESS_MS;

  const cached = readCachedLocation(cacheFreshnessMs, nowMs);
  if (cached) {
    return cached;
  }

  try {
    const fastLocation = await params.readCurrentLocation({
      enableHighAccuracy: false,
      timeout: FAST_TIMEOUT_MS,
      maximumAge: FAST_MAX_AGE_MS,
    });
    cacheLocation(fastLocation, nowMs);
    return fastLocation;
  } catch (error) {
    if (!isOfferLocationPolicyError(error) || !isRecoverableErrorCode(error.code)) {
      throw error;
    }
  }

  const preciseLocation = await params.readCurrentLocation({
    enableHighAccuracy: true,
    timeout: PRECISE_TIMEOUT_MS,
    maximumAge: 0,
  });
  cacheLocation(preciseLocation, nowMs);
  return preciseLocation;
};

export const prefetchOfferCurrentLocationWithPolicy = async (
  params: ReadOfferCurrentLocationWithPolicyParams,
): Promise<void> => {
  try {
    await readOfferCurrentLocationWithPolicy({
      ...params,
      preferCachedWithinMs: SUBMIT_CACHE_FRESHNESS_MS,
    });
  } catch {
    // Prefetch is opportunistic and should not block UI flows.
  }
};

export const clearOfferLocationCacheForTest = (): void => {
  cachedOfferLocation = null;
};
