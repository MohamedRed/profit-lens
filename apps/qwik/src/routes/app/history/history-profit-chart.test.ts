import { describe, expect, it } from 'vitest';
import type { OfferStatsDay } from '../../../lib/types/offer';
import { buildProfitChartGeometry, buildProfitYearSeries, extractProfitYears } from './history-profit-chart';

describe('history profit chart helpers', () => {
  it('extracts sorted years from stats', () => {
    const stats: OfferStatsDay[] = [
      { dayStart: new Date(Date.UTC(2025, 0, 8)), offerCount: 1, netProfitEuro: 12 },
      { dayStart: new Date(Date.UTC(2024, 5, 1)), offerCount: 1, netProfitEuro: 8 },
    ];

    const years = extractProfitYears(stats);
    expect(years[0]).toBeGreaterThanOrEqual(years[1]);
    expect(years).toContain(2025);
    expect(years).toContain(2024);
  });

  it('falls back to current year when stats are empty', () => {
    expect(extractProfitYears([])).toEqual([new Date().getUTCFullYear()]);
  });

  it('builds monthly average series and year-over-year growth', () => {
    const stats: OfferStatsDay[] = [
      { dayStart: new Date(Date.UTC(2025, 0, 3)), offerCount: 2, netProfitEuro: 30 },
      { dayStart: new Date(Date.UTC(2025, 0, 19)), offerCount: 1, netProfitEuro: 30 },
      { dayStart: new Date(Date.UTC(2024, 0, 10)), offerCount: 2, netProfitEuro: 20 },
    ];

    const series = buildProfitYearSeries(stats, 2025, 'en-US');
    expect(series.months[0].averageProfitEuro).toBeCloseTo(20, 6);
    expect(series.averageProfitEuro).toBeCloseTo(20, 6);
    expect(series.growthPercent).toBeCloseTo(100, 6);
  });

  it('creates chart geometry with threshold and paths', () => {
    const stats: OfferStatsDay[] = [
      { dayStart: new Date(Date.UTC(2025, 0, 3)), offerCount: 1, netProfitEuro: 15 },
      { dayStart: new Date(Date.UTC(2025, 1, 9)), offerCount: 1, netProfitEuro: -5 },
    ];

    const series = buildProfitYearSeries(stats, 2025, 'en-US');
    const geometry = buildProfitChartGeometry(series.months);

    expect(geometry.yTicks).toHaveLength(6);
    expect(geometry.profitLinePath.startsWith('M')).toBe(true);
    expect(geometry.areaPath.endsWith('Z')).toBe(true);
    expect(Number.isFinite(geometry.thresholdY)).toBe(true);
  });
});
