import type { OfferStatsDay } from '../../../lib/types/offer';

interface HistoryStatsPrefetchCacheEntry {
  uid: string;
  fetchedAtMs: number;
  stats: OfferStatsDay[];
}

const historyStatsPrefetchTtlMs = 2 * 60 * 1000;

let historyStatsPrefetchCache: HistoryStatsPrefetchCacheEntry | null = null;

const cloneStats = (stats: OfferStatsDay[]): OfferStatsDay[] => {
  return stats.map((item) => ({
    ...item,
    dayStart: new Date(item.dayStart),
  }));
};

export const readPrefetchedHistoryStats = (uid: string): OfferStatsDay[] | null => {
  if (!historyStatsPrefetchCache || historyStatsPrefetchCache.uid !== uid) {
    return null;
  }
  if (Date.now() - historyStatsPrefetchCache.fetchedAtMs > historyStatsPrefetchTtlMs) {
    return null;
  }
  return cloneStats(historyStatsPrefetchCache.stats);
};

export const savePrefetchedHistoryStats = (uid: string, stats: OfferStatsDay[]): void => {
  historyStatsPrefetchCache = {
    uid,
    fetchedAtMs: Date.now(),
    stats: cloneStats(stats),
  };
};
