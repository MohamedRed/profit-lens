import { component$, type PropFunction, type Signal } from '@builder.io/qwik';
import { Button } from '../../../../../components/ui/button';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkImportHeroProps {
  busy: boolean;
  disabled: boolean;
  importFileInputRef: Signal<HTMLInputElement | undefined>;
  onChooseImport$: PropFunction<() => void>;
  onImportInputChange$: PropFunction<(event: Event, input: HTMLInputElement) => Promise<void>>;
  onOpenSettings$: PropFunction<() => void>;
}

export const BulkImportHero = component$<BulkImportHeroProps>((props) => {
  const i18n = useI18n();
  const importScreenshotLabel = t(i18n, 'bulkImportScreenshotsButton', 'Import screenshots');
  const analyzingCtaLabel = t(i18n, 'offerAnalyzingLabel', 'Analysing...');

  return (
    <section class="ui-offer-import-hero" aria-label={importScreenshotLabel}>
      <div class="ui-offer-import-cta-row">
        <button
          type="button"
          class="ui-button ui-button-ghost ui-button-lg ui-offer-setup-settings-button"
          aria-label={t(i18n, 'showOfferSetupButton', 'Show setup')}
          data-allow-left-edge-tap
          onClick$={props.onOpenSettings$}
        >
          <span class="material-icons-outlined ui-offer-setup-settings-icon" aria-hidden="true">
            settings
          </span>
        </button>

        <div class="ui-offer-file-cta-shell">
          <Button
            variant="default"
            size="lg"
            type="button"
            class="ui-offer-primary-cta"
            disabled={props.disabled}
            aria-label={importScreenshotLabel}
            onClick$={props.onChooseImport$}
          >
            {props.busy ? (
              <span class="ui-offer-cta-loading-content">
                <span class="material-icons-outlined ui-offer-cta-loading-icon" aria-hidden="true">
                  manage_search
                </span>
                <span>{analyzingCtaLabel}</span>
              </span>
            ) : (
              importScreenshotLabel
            )}
          </Button>
          <input
            class="ui-offer-file-input-hidden"
            type="file"
            accept="image/*"
            multiple
            ref={props.importFileInputRef}
            onChange$={props.onImportInputChange$}
            disabled={props.disabled}
          />
        </div>
      </div>
    </section>
  );
});
