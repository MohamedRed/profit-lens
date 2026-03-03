import { describe, expect, it } from 'vitest';
import { formatCurrency, formatDateTime, formatDayLabel, formatNumber, formatPercentDelta } from './format';

describe('admin format utils', () => {
  it('formats currency values in EUR', () => {
    expect(formatCurrency(12.3)).toContain('12.3');
  });

  it('formats number values', () => {
    expect(formatNumber(12345)).toContain('12');
  });

  it('formats datetime values', () => {
    expect(formatDateTime('2026-01-05T10:30:00.000Z')).not.toBe('—');
  });

  it('formats day labels from ISO day keys', () => {
    expect(formatDayLabel('2026-01-05')).toMatch(/Jan/i);
  });

  it('formats percent deltas with sign', () => {
    expect(formatPercentDelta(4.21)).toBe('+4.2%');
    expect(formatPercentDelta(-1.1)).toBe('-1.1%');
  });
});
