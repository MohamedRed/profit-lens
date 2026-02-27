import { component$ } from '@builder.io/qwik';
import { VisualOptionPicker } from '../../../../../components/ui/visual-option-picker';
import {
  showEnergySectionForVehicleType,
  showEnergyTypeSelectorForVehicleType,
  vehicleConsumptionSuffix,
  vehicleEnergyPriceSuffix,
} from '../../../../../lib/features/vehicles/vehicle-form-utils';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import { buildVehicleEditorVisualOptions } from '../vehicle-editor-visual-options';
import type { VehicleEditorState } from '../vehicle-editor-state';

interface VehicleEnergySectionProps {
  state: VehicleEditorState;
  showHeading?: boolean;
}

export const VehicleEnergySection = component$<VehicleEnergySectionProps>(
  ({ state, showHeading = true }) => {
    const i18n = useI18n();
    const showEnergySection = showEnergySectionForVehicleType(state.draft.value.type);
    const showEnergyType = showEnergyTypeSelectorForVehicleType(state.draft.value.type);
    const showFuelType = showEnergyType && state.draft.value.energyType === 'fuel';
    const { energyOptions, fuelOptions } = buildVehicleEditorVisualOptions(i18n);

    if (!showEnergySection) {
      return null;
    }

    return (
      <>
        {showHeading ? (
          <p class="ui-settings-field-heading">
            {t(i18n, 'vehicleEnergySectionTitle', 'Energy & consumption')}
          </p>
        ) : null}

        {showEnergyType ? (
          <div class="ui-settings-field">
            <span class="ui-label">{t(i18n, 'energyTypeLabel', 'Energy type')}</span>
            <VisualOptionPicker
              ariaLabel={t(i18n, 'energyTypeLabel', 'Energy type')}
              compact
              columns={3}
              value={state.draft.value.energyType}
              options={energyOptions}
              onChange$={(value) => state.applyEnergyType$(value)}
            />
          </div>
        ) : null}

        {showFuelType ? (
          <div class="ui-settings-field">
            <span class="ui-label">{t(i18n, 'fuelTypeLabel', 'Fuel type')}</span>
            <VisualOptionPicker
              ariaLabel={t(i18n, 'fuelTypeLabel', 'Fuel type')}
              columns={2}
              value={state.draft.value.fuelType || 'e10'}
              options={fuelOptions}
              onChange$={(value) => state.applyFuelType$(value)}
            />
          </div>
        ) : null}

        <div class="ui-settings-field">
          <label class="ui-label" for="vehicle-consumption">
            {t(i18n, 'consumptionLabel', 'Consumption per 100 km')}
          </label>
          <input
            id="vehicle-consumption"
            class="ui-input"
            type="number"
            step="0.01"
            value={state.draft.value.energyConsumptionPer100Km}
            onInput$={(_, element) => {
              if (state.useVehiclePresets.value && !state.isApplyingPreset.value) {
                state.useVehiclePresets.value = false;
              }
              state.draft.value = { ...state.draft.value, energyConsumptionPer100Km: element.value };
            }}
          />
          {vehicleConsumptionSuffix(state.draft.value.energyType) ? (
            <p class="ui-settings-field-hint">{vehicleConsumptionSuffix(state.draft.value.energyType)}</p>
          ) : null}
        </div>

        <div class="ui-settings-field">
          <label class="ui-label" for="vehicle-energy-price">
            {t(i18n, 'energyPriceLabel', 'Energy price per unit')}
          </label>
          <input
            id="vehicle-energy-price"
            class="ui-input"
            type="number"
            step="0.0001"
            value={state.draft.value.energyPricePerUnit}
            onInput$={(_, element) => {
              state.draft.value = { ...state.draft.value, energyPricePerUnit: element.value };
            }}
          />
          <p class="ui-settings-field-hint">{vehicleEnergyPriceSuffix(state.draft.value.energyType)}</p>
        </div>
      </>
    );
  },
);
