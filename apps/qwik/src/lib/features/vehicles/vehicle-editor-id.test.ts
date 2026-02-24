import { describe, expect, it } from 'vitest';
import { readVehicleEditorId } from './vehicle-editor-id';

describe('vehicle-editor-id', () => {
  it('prefers route params when provided', () => {
    expect(readVehicleEditorId('vehicle-123', '/next/app/settings/vehicles/other', '')).toBe('vehicle-123');
  });

  it('reads id from query string', () => {
    expect(readVehicleEditorId(undefined, '/next/app/settings/vehicles/edit', '?vehicleId=vehicle-123')).toBe(
      'vehicle-123',
    );
  });

  it('reads id from direct /next path', () => {
    expect(readVehicleEditorId(undefined, '/next/app/settings/vehicles/vehicle-123', '')).toBe('vehicle-123');
  });

  it('reads id from direct /app path', () => {
    expect(readVehicleEditorId(undefined, '/app/settings/vehicles/vehicle-123', '')).toBe('vehicle-123');
  });

  it('reads id from legacy /edit path', () => {
    expect(readVehicleEditorId(undefined, '/next/app/settings/vehicles/edit/vehicle-123', '')).toBe('vehicle-123');
  });

  it('rejects reserved route keywords', () => {
    expect(readVehicleEditorId(undefined, '/next/app/settings/vehicles/new', '')).toBeNull();
    expect(readVehicleEditorId(undefined, '/next/app/settings/vehicles/edit', '')).toBeNull();
  });

  it('rejects ids containing a slash', () => {
    expect(readVehicleEditorId(undefined, '/next/app/settings/vehicles/a%2Fb', '')).toBeNull();
  });
});
