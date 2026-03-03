import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { VehicleEditorState } from '../vehicle-editor-state';

interface VehicleCostsSectionProps {
  state: VehicleEditorState;
  showHeading?: boolean;
}

export const VehicleCostsSection = component$<VehicleCostsSectionProps>(
  ({ state, showHeading = true }) => {
    const i18n = useI18n();

    return (
      <>
        {showHeading ? (
          <p class="ui-settings-field-heading">
            {t(i18n, 'vehicleCostsSectionTitle', 'Maintenance & depreciation')}
          </p>
        ) : null}

        <div class="ui-settings-field">
          <label class="ui-label" for="vehicle-maintenance">
            {t(i18n, 'maintenanceLabel', 'Maintenance per km')}
          </label>
          <input
            id="vehicle-maintenance"
            class="ui-input"
            type="number"
            step="0.01"
            value={state.draft.value.maintenancePerKm}
            onInput$={(_, element) => {
              if (state.useVehiclePresets.value && !state.isApplyingPreset.value) {
                state.useVehiclePresets.value = false;
              }
              state.draft.value = { ...state.draft.value, maintenancePerKm: element.value };
            }}
          />
          <p class="ui-settings-field-hint">{t(i18n, 'maintenanceUnitHint', 'EUR/km')}</p>
        </div>

        <div class="ui-settings-field">
          <label class="ui-label" for="vehicle-depreciation">
            {t(i18n, 'depreciationLabel', 'Depreciation per km')}
          </label>
          <input
            id="vehicle-depreciation"
            class="ui-input"
            type="number"
            step="0.01"
            value={state.draft.value.depreciationPerKm}
            onInput$={(_, element) => {
              if (state.useVehiclePresets.value && !state.isApplyingPreset.value) {
                state.useVehiclePresets.value = false;
              }
              state.draft.value = { ...state.draft.value, depreciationPerKm: element.value };
            }}
          />
          <p class="ui-settings-field-hint">{t(i18n, 'depreciationUnitHint', 'EUR/km')}</p>
        </div>
      </>
    );
  },
);
