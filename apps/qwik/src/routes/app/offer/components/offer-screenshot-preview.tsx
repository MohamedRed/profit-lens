import { $, component$, type QRL, useSignal } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { ImagePreviewModal } from '../../../../components/ui/image-preview-modal';

interface OfferScreenshotPreviewProps {
  previewSrc: string;
  thumbnailSrc: string;
  onRemove$: QRL<() => void>;
  removeDisabled?: boolean;
}

export const OfferScreenshotPreview = component$<OfferScreenshotPreviewProps>(
  ({ previewSrc, thumbnailSrc, onRemove$, removeDisabled = false }) => {
    const i18n = useI18n();
    const previewModalSrc = useSignal<string | null>(null);

    const openPreview$ = $(() => {
      previewModalSrc.value = previewSrc;
    });

    const closePreview$ = $(() => {
      previewModalSrc.value = null;
    });

    return (
      <>
        <div class="ui-offer-screenshot-preview">
          <button
            type="button"
            class="ui-offer-screenshot-thumb"
            aria-label={t(i18n, 'importedScreenshotTitle', 'Imported screenshot')}
            onClick$={openPreview$}
          >
            <img
              src={thumbnailSrc}
              alt={t(i18n, 'importedScreenshotTitle', 'Imported screenshot')}
              width={64}
              height={64}
              loading="lazy"
            />
          </button>
          <div class="ui-offer-screenshot-meta">
            <p class="ui-offer-screenshot-title">{t(i18n, 'importedScreenshotTitle', 'Imported screenshot')}</p>
            <p class="ui-offer-screenshot-subtitle">{t(i18n, 'tapToOpenLabel', 'Tap to open')}</p>
          </div>
          <button
            type="button"
            class="ui-offer-screenshot-remove"
            aria-label={t(i18n, 'removeScreenshotLabel', 'Remove screenshot')}
            disabled={removeDisabled}
            onClick$={onRemove$}
          >
            <span class="material-icons-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <ImagePreviewModal
          alt={t(i18n, 'importedScreenshotTitle', 'Imported screenshot')}
          isOpen={previewModalSrc.value !== null}
          onClose$={closePreview$}
          src={previewModalSrc.value}
        />
      </>
    );
  },
);
