import { describe, expect, it } from 'vitest';
import type { BulkParsedRow } from '../../../../lib/types/bulk-offers';
import { patchBulkRow, removeBulkRow, resolveVehicleSelection } from './bulk-helpers';

const makeRow = (sourceIndex: number): BulkParsedRow => ({
  sourceIndex,
  payoutEuro: 10,
  distanceKm: 2,
  durationMinutes: 12,
  deliveryTime: '12:30',
  pickupName: null,
  pickupAddress: null,
  dropoffName: null,
  dropoffAddress: null,
  tipEuro: null,
  confidence: null,
});

describe('bulk-helpers', () => {
  it('keeps previous vehicle when available', () => {
    const selected = resolveVehicleSelection(
      'v2',
      [
        { id: 'v1', name: 'A', type: 'car', energyType: 'fuel', energyConsumptionPer100Km: 5, energyPricePerUnit: 1, maintenancePerKm: 0.1, depreciationPerKm: 0.2 },
        { id: 'v2', name: 'B', type: 'car', energyType: 'fuel', energyConsumptionPer100Km: 5, energyPricePerUnit: 1, maintenancePerKm: 0.1, depreciationPerKm: 0.2 },
      ],
      'v1',
    );
    expect(selected).toBe('v2');
  });

  it('patches a single row', () => {
    const rows = [makeRow(0), makeRow(1)];
    const next = patchBulkRow(rows, 1, { payoutEuro: 25 });
    expect(next[0]?.payoutEuro).toBe(10);
    expect(next[1]?.payoutEuro).toBe(25);
  });

  it('removes one row by index', () => {
    const rows = [makeRow(0), makeRow(1), makeRow(2)];
    const next = removeBulkRow(rows, 1);
    expect(next.map((row) => row.sourceIndex)).toEqual([0, 2]);
  });
});
