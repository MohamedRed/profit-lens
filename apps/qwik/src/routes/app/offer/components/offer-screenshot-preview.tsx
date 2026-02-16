import { component$, type QRL } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';

interface OfferScreenshotPreviewProps {
  src: string;
  onRemove$: QRL<() => void>;
}

export const OfferScreenshotPreview = component$<OfferScreenshotPreviewProps>(({ src, onRemove$ }) => {
  const i18n = useI18n();

  return (
    <div class="ui-offer-screenshot-preview">
      <button
        type="button"
        class="ui-offer-screenshot-thumb"
        aria-label={t(i18n, 'importedScreenshotTitle', 'Imported screenshot')}
        onClick$={() => {
          window.open(src, '_blank', 'noopener,noreferrer');
        }}
      >
        <img
          src={src}
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
        onClick$={onRemove$}
      >
        <span class="material-icons-outlined" aria-hidden="true">
          close
        </span>
      </button>
    </div>
  );
});
