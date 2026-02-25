import { describe, expect, it } from 'vitest';
import { parseOfferAnalysisRecord } from './offer-analysis-result';

describe('parseOfferAnalysisRecord', () => {
  it('returns null when payload does not contain a record id', () => {
    const parsed = parseOfferAnalysisRecord({
      record: {
        offer: { payoutEuro: 12, distanceKm: 2 },
        breakdown: { totalCosts: 5, netProfit: 7 },
      },
    });
    expect(parsed).toBeNull();
  });

  it('returns null when payload id is blank', () => {
    const parsed = parseOfferAnalysisRecord({
      record: {
        id: '   ',
        offer: { payoutEuro: 12, distanceKm: 2 },
        breakdown: { totalCosts: 5, netProfit: 7 },
      },
    });
    expect(parsed).toBeNull();
  });

  it('parses a valid analysis response', () => {
    const parsed = parseOfferAnalysisRecord({
      record: {
        id: 'offer_123',
        source: 'screenshot',
        createdAt: '2026-02-25T12:30:00.000Z',
        offer: {
          payoutEuro: 28,
          distanceKm: 9.5,
          durationMinutes: 25,
        },
        breakdown: {
          totalCosts: 14,
          netProfit: 14,
        },
      },
    });

    expect(parsed).not.toBeNull();
    expect(parsed?.id).toBe('offer_123');
    expect(parsed?.offer.payoutEuro).toBe(28);
    expect(parsed?.breakdown.netProfit).toBe(14);
  });
});
