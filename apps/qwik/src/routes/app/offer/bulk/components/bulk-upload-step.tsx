import { $, component$, type PropFunction } from '@builder.io/qwik';
import type { VehicleProfile } from '../../../../../lib/types/vehicle';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkUploadStepProps {
  vehicles: VehicleProfile[];
  selectedVehicleId: string;
  serviceDateIso: string;
  parseInFlight: boolean;
  onVehicleChange$: PropFunction<(vehicleId: string) => void>;
  onServiceDateChange$: PropFunction<(serviceDateIso: string) => void>;
  onFileSelected$: PropFunction<(file: File | null) => void>;
  onParse$: PropFunction<() => Promise<void>>;
}

export const BulkUploadStep = component$<BulkUploadStepProps>((props) => {
  const i18n = useI18n();
  const onFileChange$ = $((_: Event, input: HTMLInputElement) => {
    const next = input.files?.[0] ?? null;
    props.onFileSelected$(next);
  });

  return (
    <section class="ui-offer-bulk-section">
      <header class="ui-offer-bulk-section-head">
        <h2>{t(i18n, 'bulkShiftTitle', 'Shift analysis')}</h2>
        <p>{t(i18n, 'bulkShiftSubtitle', 'Import a day screenshot and review each delivery before saving.')}</p>
      </header>

      <div class="ui-offer-bulk-grid">
        <label class="ui-field">
          <span>{t(i18n, 'vehicleSelectLabel', 'Select vehicle')}</span>
          <select
            class="ui-input"
            value={props.selectedVehicleId}
            onChange$={(_, input) => props.onVehicleChange$(input.value)}
          >
            <option value="">{t(i18n, 'vehicleSelectLabel', 'Select vehicle')}</option>
            {props.vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </label>

        <label class="ui-field">
          <span>{t(i18n, 'bulkShiftDateLabel', 'Service date')}</span>
          <input
            class="ui-input"
            type="date"
            value={props.serviceDateIso}
            onInput$={(_, input) => props.onServiceDateChange$(input.value)}
          />
        </label>
      </div>

      <label class="ui-button ui-button-secondary ui-button-lg ui-offer-bulk-file-trigger">
        {t(i18n, 'bulkSelectScreenshotButton', 'Choose screenshot')}
        <input
          class="ui-offer-file-input-hidden"
          type="file"
          accept="image/*"
          onChange$={onFileChange$}
          disabled={props.parseInFlight}
        />
      </label>

      <button
        type="button"
        class="ui-button ui-button-lg ui-offer-primary-cta"
        disabled={props.parseInFlight}
        onClick$={props.onParse$}
      >
        {props.parseInFlight
          ? t(i18n, 'offerAnalyzingLabel', 'Analysing...')
          : t(i18n, 'bulkParseButton', 'Parse screenshot')}
      </button>
    </section>
  );
});
