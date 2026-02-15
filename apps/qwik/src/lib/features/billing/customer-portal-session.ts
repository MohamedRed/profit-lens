import { callCreateCustomerPortalSession } from '../../firebase/callables';

const PREFETCH_TTL_MS = 15 * 60_000;

export type PortalUrlResolveSource = 'cache' | 'network' | 'in_flight';

export interface PortalSessionResolution {
  url: string;
  source: PortalUrlResolveSource;
  cacheAgeMs: number | null;
}

let cachedUrl: string | null = null;
let cachedAtMs = 0;
let inFlightRequest: Promise<string> | null = null;

const clearCache = () => {
  cachedUrl = null;
  cachedAtMs = 0;
};

const hasFreshCache = (): boolean => {
  if (!cachedUrl) {
    return false;
  }
  return Date.now() - cachedAtMs <= PREFETCH_TTL_MS;
};

const readCacheAgeMs = (): number | null => {
  if (!cachedUrl || !cachedAtMs) {
    return null;
  }
  return Date.now() - cachedAtMs;
};

const resolveCustomerPortalUrl = async (): Promise<string> => {
  const origin = globalThis.location?.origin;
  if (!origin) {
    throw new Error('Missing browser origin.');
  }
  const payload = await callCreateCustomerPortalSession({ origin });
  const url = payload.url as string | undefined;
  if (!url) {
    throw new Error('Missing customer portal URL.');
  }
  return url;
};

const requestPortalUrl = async (): Promise<PortalSessionResolution> => {
  if (hasFreshCache()) {
    return {
      url: cachedUrl as string,
      source: 'cache',
      cacheAgeMs: readCacheAgeMs(),
    };
  }
  if (inFlightRequest) {
    const url = await inFlightRequest;
    return {
      url,
      source: 'in_flight',
      cacheAgeMs: readCacheAgeMs(),
    };
  }
  inFlightRequest = resolveCustomerPortalUrl()
    .then((url) => {
      cachedUrl = url;
      cachedAtMs = Date.now();
      return url;
    })
    .finally(() => {
      inFlightRequest = null;
    });
  const url = await inFlightRequest;
  return {
    url,
    source: 'network',
    cacheAgeMs: null,
  };
};

export const prefetchCustomerPortalSession = async (): Promise<void> => {
  await requestPortalUrl();
};

export const consumeCustomerPortalSession = async (): Promise<PortalSessionResolution> => {
  const resolution = await requestPortalUrl();
  clearCache();
  return resolution;
};

export const __resetCustomerPortalSessionCacheForTests = () => {
  clearCache();
  inFlightRequest = null;
};
