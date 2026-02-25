import { describe, expect, it } from 'vitest';
import type { OfferRecord } from '../../../lib/types/offer';
import {
  readHistoryTabSessionState,
  upsertHistoryTabSessionOffer,
  writeHistoryTabSessionState,
} from './history-tab-session';

const createOffer = (id: string, createdAtIso: string): OfferRecord => ({
  id,
  source: 'manual',
  createdAt: new Date(createdAtIso),
  payoutEuro: 10,
  distanceKm: 4,
  durationMinutes: 10,
  netProfitEuro: 5,
  totalCostsEuro: 5,
});

describe('history-tab-session', () => {
  it('upserts a new offer at the top when session exists', () => {
    writeHistoryTabSessionState({
      uid: 'uid_1',
      offers: [createOffer('offer_1', '2026-02-25T10:00:00.000Z')],
      offersCursor: null,
      stats: [],
      hasMore: true,
      hasLoadMoreError: false,
      selectedTabIndex: 1,
    });

    upsertHistoryTabSessionOffer('uid_1', createOffer('offer_2', '2026-02-25T11:00:00.000Z'));

    const next = readHistoryTabSessionState('uid_1');
    expect(next?.offers.map((offer) => offer.id)).toEqual(['offer_2', 'offer_1']);
  });

  it('deduplicates existing offer id when upserting', () => {
    writeHistoryTabSessionState({
      uid: 'uid_2',
      offers: [createOffer('offer_1', '2026-02-25T10:00:00.000Z')],
      offersCursor: null,
      stats: [],
      hasMore: true,
      hasLoadMoreError: false,
      selectedTabIndex: 1,
    });

    upsertHistoryTabSessionOffer('uid_2', createOffer('offer_1', '2026-02-25T12:00:00.000Z'));

    const next = readHistoryTabSessionState('uid_2');
    expect(next?.offers).toHaveLength(1);
    expect(next?.offers[0]?.createdAt?.toISOString()).toBe('2026-02-25T12:00:00.000Z');
  });

  it('does nothing when session is missing for uid', () => {
    writeHistoryTabSessionState({
      uid: 'uid_3',
      offers: [createOffer('offer_1', '2026-02-25T10:00:00.000Z')],
      offersCursor: null,
      stats: [],
      hasMore: true,
      hasLoadMoreError: false,
      selectedTabIndex: 1,
    });

    upsertHistoryTabSessionOffer('uid_other', createOffer('offer_2', '2026-02-25T12:00:00.000Z'));

    const next = readHistoryTabSessionState('uid_3');
    expect(next?.offers.map((offer) => offer.id)).toEqual(['offer_1']);
  });
});
