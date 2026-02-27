import { describe, expect, it } from 'vitest';
import type { OfferStatsDay } from '../../../lib/types/offer';
import { buildProfitChartGeometry, buildProfitSeriesValues } from './history-profit-chart';

describe('history profit chart helpers', () => {
  it('builds per-day per-offer values sorted by day', () => {
    const stats: OfferStatsDay[] = [
      { dayStart: new Date(Date.UTC(2025, 1, 5)), offerCount: 1, netProfitEuro: 40 },
      { dayStart: new Date(Date.UTC(2025, 0, 5)), offerCount: 2, netProfitEuro: 10 },
      { dayStart: new Date(Date.UTC(2025, 2, 5)), offerCount: 0, netProfitEuro: 10 },
    ];

    const values = buildProfitSeriesValues(stats);
    expect(values).toEqual([5, 40, 0]);
  });

  it('creates symmetric threshold-centered geometry', () => {
    const geometry = buildProfitChartGeometry([10, -20, 5]);

    expect(geometry.tickValues).toEqual([20, 10, 0, -10, -20]);
    expect(geometry.linePath.startsWith('M')).toBe(true);
    expect(geometry.areaPath.endsWith('Z')).toBe(true);
    expect(Number.isFinite(geometry.thresholdY)).toBe(true);
  });

  it('handles empty values without crashing', () => {
    const geometry = buildProfitChartGeometry([]);

    expect(geometry.tickValues).toEqual([1, 0.5, 0, -0.5, -1]);
    expect(geometry.linePath).toBe('');
    expect(geometry.areaPath).toBe('');
  });
});
