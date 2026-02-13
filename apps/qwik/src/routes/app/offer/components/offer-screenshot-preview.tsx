import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';

interface OfferScreenshotPreviewProps {
  src: string;
}

export const OfferScreenshotPreview = component$<OfferScreenshotPreviewProps>(({ src }) => {
  const i18n = useI18n();

  return (
    <button
      type="button"
      class="ui-offer-screenshot-preview"
      onClick$={() => {
        window.open(src, '_blank', 'noopener,noreferrer');
      }}
    >
      <img
        src={src}
        alt={t(i18n, 'importedScreenshotTitle', 'Imported screenshot')}
        width={64}
        height={64}
      />
      <span>{t(i18n, 'importedScreenshotTitle', 'Imported screenshot')}</span>
    </button>
  );
});
