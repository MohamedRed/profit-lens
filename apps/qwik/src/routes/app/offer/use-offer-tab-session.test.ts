import { describe, expect, it } from 'vitest';
import { shouldResumeOfferAnalysisLoading } from './use-offer-tab-session';
import type { OfferAnalysisRecord } from './offer-analysis-result';

const createAnalysisRecord = (): OfferAnalysisRecord => ({
  id: 'offer-1',
  source: 'manual',
  createdAt: '2026-03-03T00:00:00.000Z',
  offer: {
    payoutEuro: 10,
    routeVerification: null,
  },
  breakdown: {
    totalCosts: 3,
    netProfit: 7,
  },
});

describe('shouldResumeOfferAnalysisLoading', () => {
  it('resumes loading when a persisted progress status exists without result record', () => {
    const result = shouldResumeOfferAnalysisLoading('__offer_analysis_progress__:extracting', null);
    expect(result).toBe(true);
  });

  it('does not resume loading for non-progress status messages', () => {
    const result = shouldResumeOfferAnalysisLoading('Offer analyzed.', null);
    expect(result).toBe(false);
  });

  it('does not resume loading when an analysis record is already available', () => {
    const result = shouldResumeOfferAnalysisLoading(
      '__offer_analysis_progress__:verifyingRoute',
      createAnalysisRecord(),
    );
    expect(result).toBe(false);
  });
});
