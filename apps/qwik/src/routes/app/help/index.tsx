import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { getDeviceId } from '../../../lib/config/device-id';
import { useAuth } from '../../../lib/auth/auth-context';
import {
  createHelpTicket,
  transcribeHelpAudio,
  watchHelpTicket,
  watchHelpTicketAttachments,
  watchHelpTicketTimeline,
  watchHelpTickets,
} from '../../../lib/features/help/help-service';
import {
  buildHelpDrafts,
  formatHelpDate,
  maxHelpAttachments,
  statusLabel,
} from '../../../lib/features/help/help-ui-utils';
import type {
  HelpAttachmentDraft,
  HelpTicket,
  HelpTicketAttachment,
  HelpTicketTimelineEvent,
} from '../../../lib/types/help';
import { t, useI18n } from '../../../lib/i18n/i18n-context';

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();

  const tickets = useSignal<HelpTicket[]>([]);
  const selectedTicketId = useSignal('');
  const selectedTicket = useSignal<HelpTicket | null>(null);
  const selectedAttachments = useSignal<HelpTicketAttachment[]>([]);
  const selectedTimeline = useSignal<HelpTicketTimelineEvent[]>([]);

  const description = useSignal('');
  const drafts = useSignal<HelpAttachmentDraft[]>([]);
  const transcribing = useSignal(false);
  const submitting = useSignal(false);
  const status = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      tickets.value = [];
      selectedTicketId.value = '';
      selectedTicket.value = null;
      selectedAttachments.value = [];
      selectedTimeline.value = [];
      return;
    }

    const unsubscribe = watchHelpTickets(user.uid, (nextTickets: HelpTicket[]) => {
      tickets.value = nextTickets;
      if (!selectedTicketId.value && nextTickets.length > 0) {
        selectedTicketId.value = nextTickets[0].id;
      }
      if (
        selectedTicketId.value &&
        !nextTickets.some((item: HelpTicket) => item.id === selectedTicketId.value)
      ) {
        selectedTicketId.value = nextTickets[0]?.id ?? '';
      }
    });

    cleanup(() => {
      unsubscribe();
    });
  });

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    const ticketId = track(() => selectedTicketId.value);

    if (!user || !ticketId) {
      selectedTicket.value = null;
      selectedAttachments.value = [];
      selectedTimeline.value = [];
      return;
    }

    const unsubscribeTicket = watchHelpTicket(user.uid, ticketId, (ticket: HelpTicket | null) => {
      selectedTicket.value = ticket;
    });
    const unsubscribeAttachments = watchHelpTicketAttachments(
      user.uid,
      ticketId,
      (items: HelpTicketAttachment[]) => {
        selectedAttachments.value = items;
      },
    );
    const unsubscribeTimeline = watchHelpTicketTimeline(
      user.uid,
      ticketId,
      (items: HelpTicketTimelineEvent[]) => {
        selectedTimeline.value = items;
      },
    );

    cleanup(() => {
      unsubscribeTicket();
      unsubscribeAttachments();
      unsubscribeTimeline();
    });
  });

  return (
    <div class="pl-stack">
      <section class="pl-list-item pl-stack">
        <h2 style="margin:0;">{t(i18n, 'helpFormTitle', 'Submit a ticket')}</h2>
        <p class="pl-subtitle" style="margin:0;">{t(i18n, 'helpIntroBody', 'Report issues and we will keep you updated.')}</p>

        <div class="pl-field">
          <label>{t(i18n, 'helpDescriptionLabel', 'Describe the issue')}</label>
          <textarea class="pl-textarea" value={description.value} onInput$={(_, el) => (description.value = el.value)} placeholder={t(i18n, 'helpDescriptionHint', 'Steps, expected result, and what happened.')} />
        </div>

        <div class="pl-row">
          <label class="pl-button pl-button-ghost" style="display:inline-flex; align-items:center; gap:8px;">
            {t(i18n, 'helpAttachmentGalleryButton', 'Gallery')}
            <input
              type="file"
              accept="image/*,audio/*"
              multiple
              style="display:none"
              onChange$={(_, element) => {
                const files = element.files;
                if (!files || files.length === 0) {
                  return;
                }
                const nextDrafts = [...drafts.value, ...buildHelpDrafts(files)].slice(
                  0,
                  maxHelpAttachments,
                );
                drafts.value = nextDrafts;
                if (nextDrafts.length === maxHelpAttachments) {
                  status.value = t(i18n, 'helpAttachmentLimitReached', 'Attachment limit reached.');
                }
                element.value = '';
              }}
            />
          </label>

          <button
            class="pl-button pl-button-ghost"
            disabled={transcribing.value || !drafts.value.some((item) => item.type === 'audio')}
            onClick$={async () => {
              const audio = drafts.value.find((item) => item.type === 'audio');
              if (!audio) {
                return;
              }
              transcribing.value = true;
              status.value = '';
              try {
                const transcript = await transcribeHelpAudio({ file: audio.file, locale: i18n.locale.value });
                if (transcript) {
                  description.value = description.value ? `${description.value}\n\n${transcript}` : transcript;
                  status.value = t(i18n, 'helpAudioReadyLabel', 'Voice note ready');
                } else {
                  status.value = t(i18n, 'helpAudioTranscriptionFailed', 'Unable to transcribe voice note.');
                }
              } catch (error) {
                status.value = error instanceof Error ? error.message : String(error);
              } finally {
                transcribing.value = false;
              }
            }}
          >
            {transcribing.value ? t(i18n, 'helpAudioTranscribingLabel', 'Transcribing voice note...') : t(i18n, 'helpAudioRecordButton', 'Record voice note')}
          </button>

          <button class="pl-button pl-button-danger" disabled={drafts.value.length === 0} onClick$={() => (drafts.value = [])}>
            {t(i18n, 'helpAudioDeleteButton', 'Remove')}
          </button>
        </div>

        <ul class="pl-list">
          {drafts.value.map((item, index) => (
            <li key={`${item.filename}-${index}`} class="pl-list-item">
              <div><strong>{item.type === 'audio' ? t(i18n, 'helpAudioAttachmentLabel', 'Voice note') : item.filename}</strong></div>
              <div>{item.contentType} · {(item.file.size / 1024).toFixed(1)} KB</div>
            </li>
          ))}
        </ul>

        <button
          class="pl-button pl-button-primary"
          disabled={submitting.value}
          onClick$={async () => {
            const user = auth.user.value;
            if (!user) {
              status.value = 'Missing authenticated user.';
              return;
            }
            if (!description.value.trim() && drafts.value.length === 0) {
              status.value = t(i18n, 'helpDescriptionRequired', 'Add a short description.');
              return;
            }

            submitting.value = true;
            status.value = '';
            try {
              await createHelpTicket({
                uid: user.uid,
                locale: i18n.locale.value,
                deviceId: getDeviceId(),
                platform: navigator.platform || 'web',
                description: description.value.trim(),
                attachments: drafts.value,
              });
              description.value = '';
              drafts.value = [];
              status.value = t(i18n, 'helpTicketSubmitted', 'Ticket submitted.');
            } catch (error) {
              status.value = error instanceof Error ? error.message : String(error);
            } finally {
              submitting.value = false;
            }
          }}
        >
          {submitting.value ? t(i18n, 'helpSubmittingLabel', 'Submitting...') : t(i18n, 'helpSubmitButton', 'Submit ticket')}
        </button>

        <div class={{ 'pl-status': true, 'pl-status-error': Boolean(status.value) && !status.value.toLowerCase().includes('submitted'), 'pl-status-success': status.value.toLowerCase().includes('submitted') }}>{status.value}</div>
      </section>

      <section class="pl-list-item pl-stack">
        <h2 style="margin:0;">{t(i18n, 'helpTicketsTitle', 'Tickets')}</h2>
        <ul class="pl-list">
          {tickets.value.length === 0 && <li class="pl-list-item">{t(i18n, 'helpNoTicketsMessage', 'No tickets yet.')}</li>}
          {tickets.value.map((ticket) => (
            <li key={ticket.id} class="pl-list-item">
              <button class="pl-button pl-button-ghost" onClick$={() => (selectedTicketId.value = ticket.id)}>
                #{ticket.id.slice(0, 8)} ·{' '}
                {statusLabel(ticket.status, ticket.status, (key, fallbackText) =>
                  t(i18n, key, fallbackText),
                )}
              </button>
              <div>{ticket.description || t(i18n, 'helpTicketDescriptionEmpty', 'No description provided.')}</div>
              <div>
                {t(i18n, 'helpStatusUpdatedLabel', 'Status updated')}:{' '}
                {formatHelpDate(ticket.updatedAt)}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {selectedTicket.value && (
        <section class="pl-list-item pl-stack">
          <h2 style="margin:0;">{t(i18n, 'helpTicketDetailTitle', 'Ticket details')}</h2>
          <div>
            <strong>
              {statusLabel(
                selectedTicket.value.status,
                selectedTicket.value.status,
                (key, fallbackText) => t(i18n, key, fallbackText),
              )}
            </strong>
          </div>
          <div>{selectedTicket.value.delivererStatusMessage ?? ''}</div>
          <div>{selectedTicket.value.description || t(i18n, 'helpTicketDescriptionEmpty', 'No description provided.')}</div>

          <h3 style="margin:0;">{t(i18n, 'helpTicketTimelineTitle', 'Status history')}</h3>
          <ul class="pl-list">
            {selectedTimeline.value.length === 0 && <li class="pl-list-item">{t(i18n, 'helpTicketTimelineEmpty', 'No status history yet.')}</li>}
            {selectedTimeline.value.map((event) => (
              <li key={event.id} class="pl-list-item">
                <div><strong>{event.status}</strong></div>
                <div>{event.message}</div>
                <div>{formatHelpDate(event.at)}</div>
              </li>
            ))}
          </ul>

          <h3 style="margin:0;">{t(i18n, 'helpTicketAttachmentsTitle', 'Attachments')}</h3>
          <ul class="pl-list">
            {selectedAttachments.value.length === 0 && <li class="pl-list-item">{t(i18n, 'helpNoAttachmentsMessage', 'No attachments uploaded.')}</li>}
            {selectedAttachments.value.map((item) => (
              <li key={item.id} class="pl-list-item">
                <a href={item.url} target="_blank" rel="noreferrer">{item.filename}</a>
                <div>{item.contentType} · {(item.sizeBytes / 1024).toFixed(1)} KB</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
});
