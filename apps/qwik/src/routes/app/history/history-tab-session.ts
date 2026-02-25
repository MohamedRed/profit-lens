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

const hasValidOfferId = (value: unknown): value is { id: string } => {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const candidateId = (value as { id?: unknown }).id;
  return typeof candidateId === 'string' && candidateId.length > 0;
};

const normalizeOffers = (offers: OfferRecord[]): OfferRecord[] => {
  return offers.filter((offer): offer is OfferRecord => hasValidOfferId(offer));
};

export const readHistoryTabSessionState = (uid: string): HistoryTabSessionState | null => {
  if (!historyTabSessionState || historyTabSessionState.uid !== uid) {
    return null;
  }
  const normalizedOffers = normalizeOffers(historyTabSessionState.offers);
  if (normalizedOffers.length !== historyTabSessionState.offers.length) {
    historyTabSessionState = {
      ...historyTabSessionState,
      offers: normalizedOffers,
    };
  }
  return {
    ...historyTabSessionState,
    offers: [...normalizedOffers],
    stats: [...historyTabSessionState.stats],
  };
};

export const writeHistoryTabSessionState = (nextState: HistoryTabSessionState): void => {
  const normalizedOffers = normalizeOffers(nextState.offers);
  historyTabSessionState = {
    ...nextState,
    offers: [...normalizedOffers],
    stats: [...nextState.stats],
  };
};

export const upsertHistoryTabSessionOffer = (uid: string, offer: OfferRecord): void => {
  if (!hasValidOfferId(offer) || !historyTabSessionState || historyTabSessionState.uid !== uid) {
    return;
  }
  const dedupedOffers = normalizeOffers(historyTabSessionState.offers).filter(
    (item) => item.id !== offer.id,
  );
  historyTabSessionState = {
    ...historyTabSessionState,
    offers: [offer, ...dedupedOffers],
  };
};
