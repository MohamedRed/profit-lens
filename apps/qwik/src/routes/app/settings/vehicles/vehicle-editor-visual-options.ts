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
    mediaText: option.label,
  }));

  return { typeOptions, energyOptions, fuelOptions };
};
