import { $, component$, useSignal } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { HelpTicketAttachment } from '../../../../lib/types/help';
import { ImagePreviewModal } from '../../../../components/ui/image-preview-modal';
import { HelpTicketAttachmentSkeleton } from './help-ticket-attachment-skeleton';

interface HelpTicketAttachmentListProps {
  attachments: HelpTicketAttachment[];
}

const attachmentImageKey = (attachment: HelpTicketAttachment): string => `${attachment.id}:${attachment.url}`;

export const HelpTicketAttachmentList = component$<HelpTicketAttachmentListProps>(({ attachments }) => {
  const i18n = useI18n();
  const previewImageIndex = useSignal<number | null>(null);
  const loadedImageKeys = useSignal<Record<string, true>>({});
  const imageAttachments = attachments.filter((attachment) => attachment.type === 'image');
  const audioAttachments = attachments.filter((attachment) => attachment.type === 'audio');
  const allImagesLoaded =
    imageAttachments.length === 0 ||
    imageAttachments.every((attachment) => loadedImageKeys.value[attachmentImageKey(attachment)] === true);

  const openPreview$ = $((index: number) => {
    previewImageIndex.value = index;
  });

  const closePreview$ = $(() => {
    previewImageIndex.value = null;
  });

  const markImageLoaded$ = $((imageKey: string) => {
    if (loadedImageKeys.value[imageKey]) {
      return;
    }
    loadedImageKeys.value = {
      ...loadedImageKeys.value,
      [imageKey]: true,
    };
  });

  return (
    <>
      <div class="ui-help-ticket-attachments-content">
        {attachments.length === 0 ? (
          <p class="ui-help-ticket-empty">{t(i18n, 'helpAttachmentEmptyState', 'No attachments yet.')}</p>
        ) : null}

        {imageAttachments.length > 0 ? (
          <div class="ui-help-ticket-attachment-gallery-stage">
            {!allImagesLoaded ? <HelpTicketAttachmentSkeleton /> : null}
            <ul
              class={{
                'ui-help-ticket-attachment-gallery': true,
                'is-preloading': !allImagesLoaded,
              }}
              aria-hidden={allImagesLoaded ? undefined : 'true'}
            >
              {imageAttachments.map((attachment, index) => {
                const imageKey = attachmentImageKey(attachment);

                return (
                  <li key={attachment.id} class="ui-help-ticket-attachment-gallery-item">
                    <a
                      class="ui-help-ticket-attachment-thumb"
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      title={attachment.filename}
                      onClick$={(event) => {
                        event.preventDefault();
                        openPreview$(index);
                      }}
                    >
                      <img
                        class="ui-help-ticket-attachment-image"
                        src={attachment.url}
                        alt={attachment.filename}
                        width={72}
                        height={72}
                        loading={allImagesLoaded ? 'lazy' : 'eager'}
                        onLoad$={() => markImageLoaded$(imageKey)}
                        onError$={() => markImageLoaded$(imageKey)}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {audioAttachments.length > 0 ? (
          <ul class="ui-help-ticket-list">
            {audioAttachments.map((attachment) => (
              <li key={attachment.id} class="ui-help-attachment-item">
                <a class="ui-help-ticket-attachment-link" href={attachment.url} target="_blank" rel="noreferrer">
                  <div class="ui-help-attachment-audio" aria-hidden="true">
                    <span class="material-icons-outlined">graphic_eq</span>
                  </div>

                  <div class="ui-help-attachment-meta">
                    <p class="ui-help-attachment-name">{t(i18n, 'helpAudioAttachmentLabel', 'Voice note')}</p>
                    <p class="ui-help-attachment-kind">Audio</p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <ImagePreviewModal
        alt={previewImageIndex.value !== null ? imageAttachments[previewImageIndex.value]?.filename ?? '' : ''}
        initialIndex={previewImageIndex.value ?? 0}
        isOpen={previewImageIndex.value !== null}
        items={imageAttachments.map((attachment) => ({ src: attachment.url, alt: attachment.filename }))}
        onClose$={closePreview$}
        src={previewImageIndex.value !== null ? imageAttachments[previewImageIndex.value]?.url ?? null : null}
      />
    </>
  );
});
