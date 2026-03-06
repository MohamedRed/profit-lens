import { $, component$, type PropFunction } from '@builder.io/qwik';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkUploadStepProps {
  serviceDateIso: string;
  parseInFlight: boolean;
  onServiceDateChange$: PropFunction<(serviceDateIso: string) => void>;
  onImportFiles$: PropFunction<(files: File[]) => Promise<void>>;
}

export const BulkUploadStep = component$<BulkUploadStepProps>((props) => {
  const i18n = useI18n();
  const fileImportDisabled = props.parseInFlight;
  const onFileChange$ = $(async (_: Event, input: HTMLInputElement) => {
    const nextFiles = input.files ? Array.from(input.files) : [];
    await props.onImportFiles$(nextFiles);
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

      <div class="ui-offer-file-cta-shell">
        <button
          type="button"
          class="ui-button ui-button-lg ui-offer-primary-cta"
          disabled={fileImportDisabled}
        >
          {props.parseInFlight
            ? t(i18n, 'offerAnalyzingLabel', 'Analysing...')
            : t(i18n, 'bulkImportScreenshotsButton', 'Import screenshots')}
        </button>
        <input
          class="ui-offer-file-input-overlay"
          type="file"
          accept="image/*"
          multiple
          onChange$={onFileChange$}
          disabled={fileImportDisabled}
        />
      </div>
    </section>
  );
});
