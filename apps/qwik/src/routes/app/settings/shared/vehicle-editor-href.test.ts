import { describe, expect, it } from 'vitest';
import { buildVehicleEditorHref, isValidBackToHref } from './vehicle-editor-href';

describe('vehicle-editor-href', () => {
  it('builds query-based vehicle href', () => {
    expect(buildVehicleEditorHref('vehicle-123')).toBe('/next/app/settings/vehicles/edit?vehicleId=vehicle-123');
  });

  it('encodes vehicle id in query parameter', () => {
    expect(buildVehicleEditorHref('abc 123')).toBe('/next/app/settings/vehicles/edit?vehicleId=abc+123');
  });

  it('keeps valid backTo query parameter', () => {
    expect(buildVehicleEditorHref('vehicle-123', '/next/app/settings')).toBe(
      '/next/app/settings/vehicles/edit?vehicleId=vehicle-123&backTo=%2Fnext%2Fapp%2Fsettings',
    );
  });

  it('ignores invalid backTo query parameter', () => {
    expect(buildVehicleEditorHref('vehicle-123', '/next/login')).toBe('/next/app/settings/vehicles/edit?vehicleId=vehicle-123');
  });

  it('validates only /next/app/* back targets', () => {
    expect(isValidBackToHref('/next/app/settings')).toBe(true);
    expect(isValidBackToHref('/next/login')).toBe(false);
  });
});
