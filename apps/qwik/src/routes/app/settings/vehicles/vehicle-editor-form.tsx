import { component$ } from '@builder.io/qwik';
import { VisualOptionPicker } from '../../../../components/ui/visual-option-picker';
import {
  showEnergySectionForVehicleType,
  showEnergyTypeSelectorForVehicleType,
  showLicensePlateForVehicleType,
  vehicleConsumptionSuffix,
  vehicleEnergyPriceSuffix,
  vehiclePresetSources,
} from '../../../../lib/features/vehicles/vehicle-form-utils';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { PresetSourcesSection } from '../shared/preset-sources-section';
import type { VehicleEditorState } from './vehicle-editor-state';
import { buildVehicleEditorVisualOptions } from './vehicle-editor-visual-options';
import type { VehicleEditorProps } from './vehicle-editor-types';

interface VehicleEditorFormProps {
  props: VehicleEditorProps;
  state: VehicleEditorState;
  title: string;
}

export const VehicleEditorForm = component$<VehicleEditorFormProps>(({ props, state, title }) => {
  const i18n = useI18n();
  const showPlate = showLicensePlateForVehicleType(state.draft.value.type);
  const showEnergySection = showEnergySectionForVehicleType(state.draft.value.type);
  const showEnergyType = showEnergyTypeSelectorForVehicleType(state.draft.value.type);
  const showFuelType = showEnergyType && state.draft.value.energyType === 'fuel';

  const { typeOptions, energyOptions, fuelOptions } = buildVehicleEditorVisualOptions(i18n);

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">{title}</h2>
        <div class="ui-settings-form-grid">
          <p class="ui-settings-field-heading">{t(i18n, 'vehicleDetailsSectionTitle', 'Vehicle details')}</p>

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

          {showEnergySection ? (
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

          {showEnergySection ? (
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
          ) : null}

          {showEnergySection ? (
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
          ) : null}

          <p class="ui-settings-field-heading">
            {t(i18n, 'vehicleCostsSectionTitle', 'Maintenance & depreciation')}
          </p>

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
          </div>

          <PresetSourcesSection sources={vehiclePresetSources} />

          <div class="ui-settings-actions">
            <button
              type="button"
              class="ui-settings-action-button"
              disabled={state.saving.value}
              onClick$={state.save$}
            >
              {state.saving.value
                ? t(i18n, 'loadingLabel', 'Loading...')
                : t(i18n, 'saveVehicleButton', 'Save vehicle')}
            </button>
            {props.mode === 'edit' ? (
              <button
                type="button"
                class="ui-settings-action-button"
                disabled={state.deleting.value}
                onClick$={state.delete$}
              >
                {state.deleting.value
                  ? t(i18n, 'loadingLabel', 'Loading...')
                  : t(i18n, 'deleteVehicleAction', 'Delete vehicle')}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      {state.status.value ? <p class="ui-status ui-status-error">{state.status.value}</p> : null}
    </div>
  );
});
