import { component$ } from '@builder.io/qwik';
import { VisualOptionPicker } from '../../../../../components/ui/visual-option-picker';
import {
  showLicensePlateForVehicleType,
} from '../../../../../lib/features/vehicles/vehicle-form-utils';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import { buildVehicleEditorVisualOptions } from '../vehicle-editor-visual-options';
import type { VehicleEditorState } from '../vehicle-editor-state';

interface VehicleDetailsSectionProps {
  state: VehicleEditorState;
  showHeading?: boolean;
}

export const VehicleDetailsSection = component$<VehicleDetailsSectionProps>(
  ({ state, showHeading = true }) => {
    const i18n = useI18n();
    const showPlate = showLicensePlateForVehicleType(state.draft.value.type);
    const { typeOptions } = buildVehicleEditorVisualOptions(i18n);

    return (
      <>
        {showHeading ? (
          <p class="ui-settings-field-heading">
            {t(i18n, 'vehicleDetailsSectionTitle', 'Vehicle details')}
          </p>
        ) : null}

        <label class="ui-settings-checkbox">
          <input
            type="checkbox"
            checked={state.useVehiclePresets.value}
            onChange$={(_, element) => state.togglePresets$(element.checked)}
          />
          <span>{t(i18n, 'useVehiclePresetsLabel', 'Use vehicle presets')}</span>
        </label>

        <div class="ui-settings-field">
          <span class="ui-label">{t(i18n, 'vehicleTypeLabel', 'Vehicle type')}</span>
          <VisualOptionPicker
            ariaLabel={t(i18n, 'vehicleTypeLabel', 'Vehicle type')}
            columns={2}
            value={state.draft.value.type}
            options={typeOptions}
            onChange$={(value) => state.applyVehicleType$(value)}
          />
        </div>

        {showPlate ? (
          <div class="ui-settings-field">
            <label class="ui-label" for="vehicle-plate">
              {t(i18n, 'vehicleLicensePlateLabel', 'License plate')}
            </label>
            <div class="ui-settings-inline-row">
              <input
                id="vehicle-plate"
                class="ui-input"
                value={state.draft.value.licensePlate}
                onInput$={(_, element) => {
                  state.draft.value = { ...state.draft.value, licensePlate: element.value.toUpperCase() };
                }}
              />
              <button
                type="button"
                class="ui-settings-link-button ui-settings-lookup-button"
                disabled={state.isLookingUpPlate.value}
                onClick$={state.lookupByPlate$}
              >
                {state.isLookingUpPlate.value
                  ? t(i18n, 'loadingLabel', 'Loading...')
                  : t(i18n, 'plateLookupButtonLabel', 'Lookup')}
              </button>
            </div>
            <p class="ui-settings-field-hint">{t(i18n, 'vehicleLicensePlateHint', 'AA-123-AA')}</p>
          </div>
        ) : null}

        <div class="ui-settings-field">
          <label class="ui-label" for="vehicle-brand">
            {t(i18n, 'vehicleBrandLabel', 'Brand')}
          </label>
          <input
            id="vehicle-brand"
            class="ui-input"
            value={state.draft.value.brand}
            onInput$={(_, element) => {
              state.draft.value = { ...state.draft.value, brand: element.value };
            }}
            onBlur$={() => {
              void state.lookupModel$();
            }}
          />
        </div>

        <div class="ui-settings-field">
          <label class="ui-label" for="vehicle-model">
            {t(i18n, 'vehicleModelLabel', 'Model')}
          </label>
          <input
            id="vehicle-model"
            class="ui-input"
            value={state.draft.value.model}
            onInput$={(_, element) => {
              state.draft.value = { ...state.draft.value, model: element.value };
            }}
            onBlur$={() => {
              void state.lookupModel$();
            }}
          />
        </div>

        <div class="ui-settings-field">
          <label class="ui-label" for="vehicle-year">
            {t(i18n, 'vehicleRegistrationYearLabel', 'Registration year')}
          </label>
          <input
            id="vehicle-year"
            class="ui-input"
            type="number"
            step="1"
            placeholder={t(i18n, 'vehicleRegistrationYearHint', 'YYYY')}
            value={state.draft.value.registrationYear}
            onInput$={(_, element) => {
              state.draft.value = { ...state.draft.value, registrationYear: element.value };
            }}
          />
        </div>
      </>
    );
  },
);
