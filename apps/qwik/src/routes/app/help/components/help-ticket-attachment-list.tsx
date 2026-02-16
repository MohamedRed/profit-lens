import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { HelpTicketAttachment } from '../../../../lib/types/help';

interface HelpTicketAttachmentListProps {
  attachments: HelpTicketAttachment[];
}

export const HelpTicketAttachmentList = component$<HelpTicketAttachmentListProps>(({ attachments }) => {
  const i18n = useI18n();

  return (
    <ul class="ui-help-ticket-list">
      {attachments.length === 0 ? (
        <li class="ui-help-ticket-empty">{t(i18n, 'helpAttachmentEmptyState', 'No attachments yet.')}</li>
      ) : null}
      {attachments.map((attachment) => (
        <li key={attachment.id} class="ui-help-attachment-item">
          <a class="ui-help-ticket-attachment-link" href={attachment.url} target="_blank" rel="noreferrer">
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

            <span class="material-icons-outlined ui-help-ticket-attachment-open" aria-hidden="true">
              open_in_new
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
});
