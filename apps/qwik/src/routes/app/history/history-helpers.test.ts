import { afterEach, describe, expect, it, vi } from 'vitest';
import type { I18nStore } from '../../../lib/i18n/i18n-context';
import type { OfferStatsDay } from '../../../lib/types/offer';
import { averageProfit, buildSummaryHeadline } from './history-helpers';

const createI18nStore = (): I18nStore => {
  return {
    locale: { value: 'en' },
    direction: { value: 'ltr' },
    dictionary: { value: {} },
    ready: { value: true },
  } as unknown as I18nStore;
};

afterEach(() => {
  vi.useRealTimers();
});

describe('history-helpers', () => {
  it('computes weighted average profit per offer', () => {
    const entries: OfferStatsDay[] = [
      { dayStart: new Date(2026, 1, 10, 12), offerCount: 2, netProfitEuro: 6 },
      { dayStart: new Date(2026, 1, 11, 12), offerCount: 1, netProfitEuro: 3 },
    ];

    expect(averageProfit(entries)).toBeCloseTo(3, 6);
  });

  it('returns no-today summary when all stats are before today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 1, 12, 12));
    const i18n = createI18nStore();
    const stats: OfferStatsDay[] = [
      { dayStart: new Date(2026, 1, 11, 12), offerCount: 1, netProfitEuro: 4 },
    ];

    expect(buildSummaryHeadline(i18n, stats, 'en-US')).toBe('No offers today yet.');
  });

  it('detects today entries correctly in non-UTC time zones', () => {
    const previousTimezone = process.env.TZ;
    process.env.TZ = 'America/Los_Angeles';
    try {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 1, 18, 12));
      const i18n = createI18nStore();
      const stats: OfferStatsDay[] = [
        { dayStart: new Date(2026, 1, 18, 10), offerCount: 1, netProfitEuro: 8 },
        { dayStart: new Date(2026, 1, 17, 10), offerCount: 1, netProfitEuro: 3 },
      ];

      expect(buildSummaryHeadline(i18n, stats, 'en-US')).toContain('Today is more profitable');
    } finally {
      if (previousTimezone) {
        process.env.TZ = previousTimezone;
      } else {
        delete process.env.TZ;
      }
    }
  });
});
