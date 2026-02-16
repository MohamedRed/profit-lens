import { $, component$, type QRL, useSignal } from '@builder.io/qwik';
import type { HelpAttachmentDraft } from '../../../../lib/types/help';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import { ImagePreviewModal } from '../../../../components/ui/image-preview-modal';

interface HelpAttachmentDraftListProps {
  drafts: HelpAttachmentDraft[];
  onRemove$: QRL<(index: number) => void>;
}

export const HelpAttachmentDraftList = component$<HelpAttachmentDraftListProps>(({ drafts, onRemove$ }) => {
  const i18n = useI18n();
  const previewSrc = useSignal<string | null>(null);
  const previewAlt = useSignal('');

  const openPreview$ = $((src: string, alt: string) => {
    previewSrc.value = src;
    previewAlt.value = alt;
  });

  const closePreview$ = $(() => {
    previewSrc.value = null;
    previewAlt.value = '';
  });

  return (
    <>
      <ul class="ui-help-attachment-list">
        {drafts.map((item, index) => {
          const previewUrl = item.previewUrl;
          const filename = item.filename;
          const type = item.type;

          return (
            <li key={`${filename}-${index}`} class="ui-help-attachment-item">
              {type === 'image' && previewUrl ? (
                <button
                  type="button"
                  class="ui-help-attachment-thumb"
                  onClick$={() => openPreview$(previewUrl, filename)}
                  aria-label={t(i18n, 'helpAttachmentOpenPreview', 'Open screenshot')}
                >
                  <img src={previewUrl} alt={filename} width={64} height={64} loading="lazy" />
                </button>
              ) : (
                <div class="ui-help-attachment-audio" aria-hidden="true">
                  <span class="material-icons-outlined">graphic_eq</span>
                </div>
              )}

              <div class="ui-help-attachment-meta">
                <p class="ui-help-attachment-name">{filename}</p>
                <p class="ui-help-attachment-kind">{type === 'audio' ? 'Audio' : 'Image'}</p>
              </div>

              <button
                type="button"
                class="ui-help-attachment-remove"
                aria-label={t(i18n, 'helpAttachmentRemove', 'Remove attachment')}
                onClick$={() => onRemove$(index)}
              >
                <span class="material-icons-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <ImagePreviewModal
        alt={previewAlt.value}
        isOpen={previewSrc.value !== null}
        onClose$={closePreview$}
        src={previewSrc.value}
      />
    </>
  );
});
