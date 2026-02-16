import { $, component$, useSignal } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { HelpTicketAttachment } from '../../../../lib/types/help';
import { ImagePreviewModal } from '../../../../components/ui/image-preview-modal';

interface HelpTicketAttachmentListProps {
  attachments: HelpTicketAttachment[];
}

export const HelpTicketAttachmentList = component$<HelpTicketAttachmentListProps>(({ attachments }) => {
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
      <ul class="ui-help-ticket-list">
        {attachments.length === 0 ? (
          <li class="ui-help-ticket-empty">{t(i18n, 'helpAttachmentEmptyState', 'No attachments yet.')}</li>
        ) : null}
        {attachments.map((attachment) => (
          <li key={attachment.id} class="ui-help-attachment-item">
            <a
              class="ui-help-ticket-attachment-link"
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              onClick$={(event) => {
                if (attachment.type !== 'image') {
                  return;
                }
                event.preventDefault();
                openPreview$(attachment.url, attachment.filename);
              }}
            >
              {attachment.type === 'image' ? (
                <img
                  class="ui-help-ticket-attachment-image"
                  src={attachment.url}
                  alt={attachment.filename}
                  width={64}
                  height={64}
                  loading="lazy"
                />
              ) : (
                <div class="ui-help-attachment-audio" aria-hidden="true">
                  <span class="material-icons-outlined">graphic_eq</span>
                </div>
              )}

              <div class="ui-help-attachment-meta">
                <p class="ui-help-attachment-name">
                  {attachment.type === 'audio'
                    ? t(i18n, 'helpAudioAttachmentLabel', 'Voice note')
                    : attachment.filename}
                </p>
                <p class="ui-help-attachment-kind">{attachment.type === 'audio' ? 'Audio' : 'Image'}</p>
              </div>
            </a>
          </li>
        ))}
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
