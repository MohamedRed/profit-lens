import { $, component$, useSignal } from '@builder.io/qwik';
import { ImagePreviewModal } from '../../../../../components/ui/image-preview-modal';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { BulkScreenshotPreview } from '../bulk-helpers';

interface BulkScreenshotPreviewListProps {
  previews: BulkScreenshotPreview[];
}

export const BulkScreenshotPreviewList = component$<BulkScreenshotPreviewListProps>(({ previews }) => {
  const i18n = useI18n();
  const previewModal = useSignal<{ src: string; label: string } | null>(null);

  if (previews.length === 0) {
    return null;
  }

  const closePreview$ = $(() => {
    previewModal.value = null;
  });

  return (
    <>
      <section class="ui-offer-bulk-section">
        <header class="ui-offer-bulk-section-head">
          <h2>{t(i18n, 'bulkImportedScreenshotsTitle', 'Imported screenshots')}</h2>
          <p>
            {t(i18n, 'bulkImportedScreenshotsSubtitle', 'Tap any thumbnail to open full preview.')}
          </p>
        </header>

        <div class="ui-offer-bulk-preview-list">
          {previews.map((preview, index) => {
            const itemLabel = t(i18n, 'importedScreenshotTitle', 'Imported screenshot');
            return (
              <div class="ui-offer-screenshot-preview" key={preview.id}>
                <button
                  type="button"
                  class="ui-offer-screenshot-thumb"
                  aria-label={`${itemLabel} ${index + 1}`}
                  onClick$={$(() => {
                    previewModal.value = { src: preview.url, label: `${itemLabel} ${index + 1}` };
                  })}
                >
                  <img
                    src={preview.url}
                    alt={`${itemLabel} ${index + 1}`}
                    width={64}
                    height={64}
                    loading="lazy"
                  />
                </button>
                <div class="ui-offer-screenshot-meta">
                  <p class="ui-offer-screenshot-title">{`${itemLabel} #${index + 1}`}</p>
                  <p class="ui-offer-screenshot-subtitle">{preview.fileName}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ImagePreviewModal
        alt={previewModal.value?.label ?? t(i18n, 'importedScreenshotTitle', 'Imported screenshot')}
        isOpen={previewModal.value !== null}
        onClose$={closePreview$}
        src={previewModal.value?.src ?? null}
      />
    </>
  );
});
