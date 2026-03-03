import type { VisualOptionItem } from '../../../../components/ui/visual-option-picker';
import type { I18nStore } from '../../../../lib/i18n/i18n-context';
import {
  buildEnergyTypeOptions,
  buildFuelTypeOptions,
  buildVehicleTypeOptions,
} from './vehicle-editor-options';
import { resolveVehicleTypeIcon } from '../../shared/vehicle-visuals';

interface VehicleEditorVisualOptions {
  energyOptions: VisualOptionItem[];
  fuelOptions: VisualOptionItem[];
  typeOptions: VisualOptionItem[];
}

const resolveFuelTypeIcon = (fuelType: string): string => {
  if (fuelType === 'gazole') {
    return 'oil_barrel';
  }
  if (fuelType === 'e85') {
    return 'eco';
  }
  if (fuelType === 'gplc') {
    return 'propane_tank';
  }
  return 'local_gas_station';
};

export const buildVehicleEditorVisualOptions = (
  i18n: I18nStore,
): VehicleEditorVisualOptions => {
  const typeOptions = buildVehicleTypeOptions(i18n).map((option) => ({
    ...option,
    icon: resolveVehicleTypeIcon(option.value),
  }));

  const energyOptions = buildEnergyTypeOptions(i18n).map((option) => ({
    ...option,
    icon:
      option.value === 'none'
        ? 'block'
        : option.value === 'electric'
          ? 'bolt'
          : 'local_gas_station',
  }));

  const fuelOptions = buildFuelTypeOptions(i18n).map((option) => ({
    ...option,
    icon: resolveFuelTypeIcon(option.value),
  }));

  return { typeOptions, energyOptions, fuelOptions };
};
