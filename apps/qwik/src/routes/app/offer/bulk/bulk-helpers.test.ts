import { describe, expect, it } from 'vitest';
import type { BulkParsedRow } from '../../../../lib/types/bulk-offers';
import { patchBulkRow, removeBulkRow } from './bulk-helpers';

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
