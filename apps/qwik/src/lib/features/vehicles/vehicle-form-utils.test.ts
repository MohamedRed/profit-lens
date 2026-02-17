import { describe, expect, it } from 'vitest';
import {
  applyVehiclePresetValues,
  defaultEnergyTypeForVehicle,
  formatFrenchLicensePlate,
  isValidFrenchLicensePlate,
  resolveEnergyPriceDefault,
  showEnergySectionForVehicleType,
  showEnergyTypeSelectorForVehicleType,
  showLicensePlateForVehicleType,
  type VehicleDraft,
} from './vehicle-form-utils';

describe('vehicle-form-utils', () => {
  it('matches type visibility rules from Flutter form', () => {
    expect(showLicensePlateForVehicleType('car')).toBe(true);
    expect(showLicensePlateForVehicleType('bike')).toBe(false);
    expect(showEnergySectionForVehicleType('bike')).toBe(false);
    expect(showEnergyTypeSelectorForVehicleType('ebike')).toBe(false);
    expect(showEnergyTypeSelectorForVehicleType('scooter')).toBe(true);
  });

  it('matches default energy and energy price rules', () => {
    expect(defaultEnergyTypeForVehicle('bike')).toBe('none');
    expect(defaultEnergyTypeForVehicle('ebike')).toBe('electric');
    expect(resolveEnergyPriceDefault('electric', '', true)).toBe('0.1940');
    expect(resolveEnergyPriceDefault('fuel', 'e10', true)).toBe('1.6940');
  });

  it('applies presets and keeps none energy values at zero', () => {
    const draft: VehicleDraft = {
      id: 'vehicle-id',
      licensePlate: '',
      brand: '',
      model: '',
      registrationYear: '',
      type: 'bike',
      energyType: 'none',
      fuelType: '',
      energyConsumptionPer100Km: '',
      energyPricePerUnit: '',
      maintenancePerKm: '',
      depreciationPerKm: '',
    };
    const next = applyVehiclePresetValues(draft, true, { setEnergyType: true });
    expect(next.energyConsumptionPer100Km).toBe('0');
    expect(next.energyPricePerUnit).toBe('0');
  });

  it('normalizes and validates french license plate format', () => {
    expect(formatFrenchLicensePlate('ab123cd')).toBe('AB-123-CD');
    expect(isValidFrenchLicensePlate('AB-123-CD')).toBe(true);
    expect(isValidFrenchLicensePlate('INVALID')).toBe(false);
  });
});
