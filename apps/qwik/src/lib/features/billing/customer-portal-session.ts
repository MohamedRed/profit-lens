import { callCreateCustomerPortalSession } from '../../firebase/callables';

const PREFETCH_TTL_MS = 60_000;

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

const requestPortalUrl = async (): Promise<string> => {
  if (hasFreshCache()) {
    return cachedUrl as string;
  }
  if (inFlightRequest) {
    return inFlightRequest;
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
  return inFlightRequest;
};

export const prefetchCustomerPortalSession = async (): Promise<void> => {
  await requestPortalUrl();
};

export const consumeCustomerPortalSessionUrl = async (): Promise<string> => {
  const url = await requestPortalUrl();
  clearCache();
  return url;
};

export const __resetCustomerPortalSessionCacheForTests = () => {
  clearCache();
  inFlightRequest = null;
};
