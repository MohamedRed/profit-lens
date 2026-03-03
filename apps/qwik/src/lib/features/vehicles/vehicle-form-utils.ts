export type VehicleType = 'bike' | 'ebike' | 'scooter' | 'car';
export type EnergyType = 'none' | 'electric' | 'fuel';
export type FuelType = 'e10' | 'sp95' | 'sp98' | 'gazole' | 'e85' | 'gplc';

export interface VehicleDraft {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  registrationYear: string;
  type: VehicleType;
  energyType: EnergyType;
  fuelType: FuelType | '';
  energyConsumptionPer100Km: string;
  energyPricePerUnit: string;
  maintenancePerKm: string;
  depreciationPerKm: string;
}
export interface PresetSource {
  label: string;
  url: string;
  lastChecked: string;
}

const electricityPricePerKwh = 0.194;
const fuelPrices: Record<FuelType, number> = {
  e10: 1.694,
  sp95: 1.7436,
  sp98: 1.7958,
  gazole: 1.6737,
  e85: 0.769,
  gplc: 0.9733,
};

const vehiclePresets: Record<VehicleType, Partial<Record<EnergyType, {
  consumptionPer100Km: number;
  maintenancePerKm: number;
  depreciationPerKm: number;
  fuelType: FuelType | null;
}>>> = {
  bike: {
    none: {
      consumptionPer100Km: 0,
      maintenancePerKm: 0.02,
      depreciationPerKm: 0.01,
      fuelType: null,
    },
  },
  ebike: {
    electric: {
      consumptionPer100Km: 1,
      maintenancePerKm: 0.03,
      depreciationPerKm: 0.05,
      fuelType: null,
    },
  },
  scooter: {
    fuel: {
      consumptionPer100Km: 3.2,
      maintenancePerKm: 0.04,
      depreciationPerKm: 0.06,
      fuelType: 'e10',
    },
    electric: {
      consumptionPer100Km: 4,
      maintenancePerKm: 0.04,
      depreciationPerKm: 0.06,
      fuelType: null,
    },
  },
  car: {
    fuel: {
      consumptionPer100Km: 6.5,
      maintenancePerKm: 0.05,
      depreciationPerKm: 0.12,
      fuelType: 'e10',
    },
    electric: {
      consumptionPer100Km: 17,
      maintenancePerKm: 0.05,
      depreciationPerKm: 0.12,
      fuelType: null,
    },
  },
};

export const vehiclePresetSources: PresetSource[] = [
  {
    label: 'ADEME car labelling dataset (consumption for cars)',
    url: 'https://data.ademe.fr/datasets/ademe-car-labelling',
    lastChecked: '2026-01-24',
  },
  {
    label: 'ProfitLens baseline estimates (maintenance & depreciation)',
    url: 'https://github.com/MohamedRed/profit-lens/blob/main/docs/vehicle-presets.md',
    lastChecked: '2026-01-24',
  },
];

const fallbackFuelType = (fuelType: FuelType | ''): FuelType => {
  return fuelType || 'e10';
};

export const defaultEnergyTypeForVehicle = (type: VehicleType): EnergyType => {
  if (type === 'bike') {
    return 'none';
  }
  if (type === 'ebike') {
    return 'electric';
  }
  return 'fuel';
};

export const defaultFuelTypeForVehicle = (
  type: VehicleType,
  energyType: EnergyType,
): FuelType | '' => {
  if (energyType !== 'fuel') {
    return '';
  }
  if (type === 'bike' || type === 'ebike') {
    return '';
  }
  return 'e10';
};

export const vehicleConsumptionSuffix = (energyType: EnergyType): string => {
  if (energyType === 'electric') {
    return 'kWh/100 km';
  }
  if (energyType === 'fuel') {
    return 'L/100 km';
  }
  return '';
};

export const vehicleEnergyPriceSuffix = (energyType: EnergyType): string => {
  if (energyType === 'electric') {
    return 'EUR/kWh';
  }
  if (energyType === 'fuel') {
    return 'EUR/L';
  }
  return 'EUR';
};

export const resolveEnergyPriceDefault = (
  energyType: EnergyType,
  fuelType: FuelType | '',
  useFranceDefaults: boolean,
): string => {
  if (energyType === 'none') {
    return '0';
  }
  if (!useFranceDefaults) {
    return '';
  }
  if (energyType === 'electric') {
    return electricityPricePerKwh.toFixed(4);
  }
  return fuelPrices[fallbackFuelType(fuelType)].toFixed(4);
};

export const applyVehiclePresetValues = (
  draft: VehicleDraft,
  useFranceDefaults: boolean,
  options: { setEnergyType: boolean },
): VehicleDraft => {
  let next = { ...draft };
  if (options.setEnergyType) {
    next.energyType = defaultEnergyTypeForVehicle(next.type);
    next.fuelType = defaultFuelTypeForVehicle(next.type, next.energyType);
  }

  const preset = vehiclePresets[next.type]?.[next.energyType];
  if (preset) {
    next.energyConsumptionPer100Km = preset.consumptionPer100Km.toFixed(2);
    next.maintenancePerKm = preset.maintenancePerKm.toFixed(2);
    next.depreciationPerKm = preset.depreciationPerKm.toFixed(2);
    // Preserve an explicit manual fuel selection; only seed a default when empty.
    if (preset.fuelType && !next.fuelType) {
      next.fuelType = preset.fuelType;
    }
  }

  next.energyPricePerUnit = resolveEnergyPriceDefault(
    next.energyType,
    next.fuelType,
    useFranceDefaults,
  );

  if (next.energyType === 'none') {
    next.energyConsumptionPer100Km = '0';
    next.energyPricePerUnit = '0';
  }
  return next;
};

export const normalizeFrenchLicensePlate = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
};

export const formatFrenchLicensePlate = (value: string): string => {
  const normalized = normalizeFrenchLicensePlate(value);
  if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(normalized)) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5)}`;
  }
  return normalized;
};

export const isValidFrenchLicensePlate = (value: string): boolean => {
  const normalized = normalizeFrenchLicensePlate(value);
  return /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(normalized) || /^\d{1,3}[A-Z]{1,3}\d{2}$/.test(normalized);
};

export const sanitizeLookupValue = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const normalized = trimmed.toLowerCase();
  if (['unknown', 'inconnu', 'n/a', 'na', 'null', '-'].includes(normalized)) {
    return null;
  }
  if (normalized.includes('renseign') || normalized.includes('indisponible')) {
    return null;
  }
  return trimmed;
};

export const showLicensePlateForVehicleType = (type: VehicleType): boolean => {
  return type === 'car' || type === 'scooter';
};

export const showEnergySectionForVehicleType = (type: VehicleType): boolean => {
  return type !== 'bike';
};

export const showEnergyTypeSelectorForVehicleType = (type: VehicleType): boolean => {
  return type === 'car' || type === 'scooter';
};
