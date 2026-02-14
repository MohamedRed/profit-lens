import type { OfferRecord } from '../../../lib/types/offer';

const historyOfferCacheKey = 'pl-history-offers-cache';

interface SerializedOfferRecord extends Omit<OfferRecord, 'createdAt'> {
  createdAt: string | null;
}

const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
};

const serializeOffer = (offer: OfferRecord): SerializedOfferRecord => {
  return {
    ...offer,
    createdAt: offer.createdAt ? offer.createdAt.toISOString() : null,
  };
};

const deserializeOffer = (serialized: SerializedOfferRecord): OfferRecord | null => {
  const createdAt = serialized.createdAt ? new Date(serialized.createdAt) : null;
  if (serialized.createdAt && Number.isNaN(createdAt?.getTime())) {
    return null;
  }

  return {
    ...serialized,
    createdAt,
  };
};

const readRawCache = (): Record<string, SerializedOfferRecord> => {
  if (!isBrowser()) {
    return {};
  }
  const raw = sessionStorage.getItem(historyOfferCacheKey);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, SerializedOfferRecord>;
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

const writeRawCache = (value: Record<string, SerializedOfferRecord>): void => {
  if (!isBrowser()) {
    return;
  }
  sessionStorage.setItem(historyOfferCacheKey, JSON.stringify(value));
};

export const saveHistoryOfferCache = (offers: OfferRecord[]): void => {
  const nextCache: Record<string, SerializedOfferRecord> = {};
  for (const offer of offers) {
    if (!offer.id) {
      continue;
    }
    nextCache[offer.id] = serializeOffer(offer);
  }
  writeRawCache(nextCache);
};

export const upsertHistoryOfferCache = (offer: OfferRecord): void => {
  if (!offer.id) {
    return;
  }
  const cache = readRawCache();
  cache[offer.id] = serializeOffer(offer);
  writeRawCache(cache);
};

export const readHistoryOfferFromCache = (offerId: string): OfferRecord | null => {
  if (!offerId) {
    return null;
  }
  const cached = readRawCache()[offerId];
  if (!cached) {
    return null;
  }
  return deserializeOffer(cached);
};
