import {
  defaultEnergyTypeForVehicle,
  defaultFuelTypeForVehicle,
  formatFrenchLicensePlate,
  type EnergyType,
  type FuelType,
  type VehicleDraft,
  type VehicleType,
} from '../../../../lib/features/vehicles/vehicle-form-utils';
import type { VehicleProfile } from '../../../../lib/types/vehicle';

export type EditorMode = 'create' | 'edit';

export interface VehicleEditorProps {
  mode: EditorMode;
  vehicleId?: string | null;
  returnToHref?: string | null;
}

export const createVehicleId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const asVehicleType = (value: string): VehicleType => {
  if (value === 'bike' || value === 'ebike' || value === 'scooter' || value === 'car') {
    return value;
  }
  return 'car';
};

export const asEnergyType = (value: unknown): EnergyType | null => {
  return value === 'none' || value === 'electric' || value === 'fuel' ? value : null;
};

export const asFuelType = (value: unknown): FuelType | null => {
  return value === 'e10' ||
    value === 'sp95' ||
    value === 'sp98' ||
    value === 'gazole' ||
    value === 'e85' ||
    value === 'gplc'
    ? value
    : null;
};

export const parseVehicleNumber = (raw: string): number | null => {
  const parsed = Number(raw.trim());
  return Number.isFinite(parsed) ? parsed : null;
};

export const createVehicleDraft = (): VehicleDraft => {
  return {
    id: createVehicleId(),
    licensePlate: '',
    brand: '',
    model: '',
    registrationYear: '',
    type: 'car',
    energyType: 'fuel',
    fuelType: 'e10',
    energyConsumptionPer100Km: '',
    energyPricePerUnit: '',
    maintenancePerKm: '',
    depreciationPerKm: '',
  };
};

export const vehicleToDraft = (vehicle: VehicleProfile): VehicleDraft => {
  const type = asVehicleType(vehicle.type);
  const energyType = asEnergyType(vehicle.energyType) ?? defaultEnergyTypeForVehicle(type);
  return {
    id: vehicle.id,
    licensePlate: vehicle.licensePlate ? formatFrenchLicensePlate(vehicle.licensePlate) : '',
    brand: vehicle.brand ?? '',
    model: vehicle.model ?? '',
    registrationYear: vehicle.registrationYear == null ? '' : String(vehicle.registrationYear),
    type,
    energyType,
    fuelType: asFuelType(vehicle.fuelType ?? '') ?? defaultFuelTypeForVehicle(type, energyType),
    energyConsumptionPer100Km: vehicle.energyConsumptionPer100Km.toFixed(2),
    energyPricePerUnit: vehicle.energyPricePerUnit.toFixed(4),
    maintenancePerKm: vehicle.maintenancePerKm.toFixed(2),
    depreciationPerKm: vehicle.depreciationPerKm.toFixed(2),
  };
};
