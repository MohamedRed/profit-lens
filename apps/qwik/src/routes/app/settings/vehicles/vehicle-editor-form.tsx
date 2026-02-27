import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { VehicleEditorState } from './vehicle-editor-state';
import type { VehicleEditorProps } from './vehicle-editor-types';
import { VehicleCostsSection } from './components/vehicle-costs-section';
import { VehicleDetailsSection } from './components/vehicle-details-section';
import { VehicleEnergySection } from './components/vehicle-energy-section';
import { VehiclePresetSourcesSection } from './components/vehicle-preset-sources-section';

interface VehicleEditorFormProps {
  props: VehicleEditorProps;
  state: VehicleEditorState;
  title: string;
}

export const VehicleEditorForm = component$<VehicleEditorFormProps>(({ props, state, title }) => {
  const i18n = useI18n();

  return (
    <div class="ui-settings-detail-root">
      <section class="ui-settings-detail-card">
        <h2 class="ui-settings-detail-title">{title}</h2>
        <div class="ui-settings-form-grid">
          <VehicleDetailsSection state={state} />
          <VehicleEnergySection state={state} />
          <VehicleCostsSection state={state} />
          <VehiclePresetSourcesSection />

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
