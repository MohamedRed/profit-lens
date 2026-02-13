import { describe, expect, it } from 'vitest';
import {
  asNumber,
  createId,
  defaultVehicleDraft,
  formatDate,
} from './settings-utils';

describe('settings-utils', () => {
  it('parses valid numbers and falls back to 0', () => {
    expect(asNumber('12.5')).toBe(12.5);
    expect(asNumber('invalid')).toBe(0);
  });

  it('creates a complete default vehicle draft', () => {
    const vehicle = defaultVehicleDraft();
    expect(vehicle.id).toBe('');
    expect(vehicle.type).toBe('car');
    expect(vehicle.energyType).toBe('fuel');
    expect(vehicle.energyConsumptionPer100Km).toBeGreaterThan(0);
  });

  it('formats dates consistently', () => {
    expect(formatDate(null)).toBe('n/a');
    expect(formatDate(new Date('2025-01-01T10:00:00.000Z'))).not.toBe('n/a');
  });

  it('generates non-empty ids', () => {
    const first = createId();
    const second = createId();
    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(first).not.toBe(second);
  });
});
