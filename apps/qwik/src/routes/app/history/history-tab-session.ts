import type { OffersPageCursor } from '../../../lib/features/offers/offers-service';
import type { OfferRecord, OfferStatsDay } from '../../../lib/types/offer';

interface HistoryTabSessionState {
  uid: string;
  offers: OfferRecord[];
  offersCursor: OffersPageCursor | null;
  stats: OfferStatsDay[];
  hasMore: boolean;
  hasLoadMoreError: boolean;
  selectedTabIndex: number;
}

let historyTabSessionState: HistoryTabSessionState | null = null;

export const readHistoryTabSessionState = (uid: string): HistoryTabSessionState | null => {
  if (!historyTabSessionState || historyTabSessionState.uid !== uid) {
    return null;
  }
  return {
    ...historyTabSessionState,
    offers: [...historyTabSessionState.offers],
    stats: [...historyTabSessionState.stats],
  };
};

export const writeHistoryTabSessionState = (nextState: HistoryTabSessionState): void => {
  historyTabSessionState = {
    ...nextState,
    offers: [...nextState.offers],
    stats: [...nextState.stats],
  };
};
