import type { VehicleProfile } from '../../types/vehicle';

export const createId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const asNumber = (value: string): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const formatDate = (value: Date | null | undefined): string => {
  return value ? value.toLocaleString() : 'n/a';
};

export const defaultVehicleDraft = (): VehicleProfile => ({
  id: '',
  name: '',
  licensePlate: '',
  brand: '',
  model: '',
  registrationYear: null,
  type: 'car',
  energyType: 'fuel',
  fuelType: 'diesel',
  energyConsumptionPer100Km: 6.5,
  energyPricePerUnit: 1.9,
  maintenancePerKm: 0.05,
  depreciationPerKm: 0.07,
});
