import { $, component$, type PropFunction } from '@builder.io/qwik';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkUploadStepProps {
  serviceDateIso: string;
  parseInFlight: boolean;
  onServiceDateChange$: PropFunction<(serviceDateIso: string) => void>;
  onParse$: PropFunction<(file?: File | null) => Promise<void>>;
}

export const BulkUploadStep = component$<BulkUploadStepProps>((props) => {
  const i18n = useI18n();
  const fileImportDisabled = props.parseInFlight;
  const onFileChange$ = $(async (_: Event, input: HTMLInputElement) => {
    const next = input.files?.[0] ?? null;
    await props.onParse$(next);
    // Allow selecting the same file again to retrigger auto-parse.
    input.value = '';
  });

  return (
    <section class="ui-offer-bulk-section">
      <header class="ui-offer-bulk-section-head">
        <h2>{t(i18n, 'bulkShiftTitle', 'Shift analysis')}</h2>
        <p>{t(i18n, 'bulkShiftSubtitle', 'Import a day screenshot and review each delivery before saving.')}</p>
      </header>

      <div class="ui-offer-bulk-grid ui-offer-bulk-upload-grid">
        <label class="ui-field">
          <span>{t(i18n, 'bulkShiftDateLabel', 'Service date')}</span>
          <input
            class="ui-input"
            type="date"
            value={props.serviceDateIso}
            onInput$={(_, input) => props.onServiceDateChange$(input.value)}
          />
          <small class="ui-offer-bulk-date-hint">
            {t(
              i18n,
              'bulkShiftDateHint',
              'Used to place delivery times on the correct day for history and KPIs.',
            )}
          </small>
        </label>
      </div>

      <label class="ui-button ui-button-secondary ui-button-lg ui-offer-bulk-file-trigger">
        {t(i18n, 'bulkSelectScreenshotButton', 'Choose screenshot')}
        <input
          class="ui-offer-file-input-hidden"
          type="file"
          accept="image/*"
          onChange$={onFileChange$}
          disabled={fileImportDisabled}
        />
      </label>

      <button
        type="button"
        class="ui-button ui-button-lg ui-offer-primary-cta"
        disabled={props.parseInFlight}
        onClick$={$(() => props.onParse$())}
      >
        {props.parseInFlight
          ? t(i18n, 'offerAnalyzingLabel', 'Analysing...')
          : t(i18n, 'bulkParseButton', 'Parse screenshot')}
      </button>
    </section>
  );
});
