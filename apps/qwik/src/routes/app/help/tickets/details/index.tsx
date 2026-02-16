import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../../../../lib/auth/auth-context';
import { readHelpTicketId } from '../../../../../lib/features/help/help-ticket-id';
import {
  watchHelpTicket,
  watchHelpTicketAttachments,
  watchHelpTicketTimeline,
} from '../../../../../lib/features/help/help-service';
import {
  delivererStatusLabel,
  formatHelpDate,
  statusLabel,
} from '../../../../../lib/features/help/help-ui-utils';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { HelpTicket, HelpTicketAttachment, HelpTicketTimelineEvent } from '../../../../../lib/types/help';

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const i18n = useI18n();

  const loading = useSignal(true);
  const ticket = useSignal<HelpTicket | null>(null);
  const attachments = useSignal<HelpTicketAttachment[]>([]);
  const timeline = useSignal<HelpTicketTimelineEvent[]>([]);

  const goBack$ = $(async () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    await navigate('/next/app/help/tickets');
  });

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    const ticketParam = track(() => location.params.ticketId);
    const path = track(() => location.url.pathname);
    const search = track(() => location.url.search);
    const hash = track(() => location.url.hash);
    const ticketId = readHelpTicketId(ticketParam, path, search, hash);

    if (!user || !ticketId) {
      loading.value = false;
      ticket.value = null;
      attachments.value = [];
      timeline.value = [];
      return;
    }

    loading.value = true;
    const unsubscribeTicket = watchHelpTicket(user.uid, ticketId, (value) => {
      ticket.value = value;
      loading.value = false;
    });
    const unsubscribeAttachments = watchHelpTicketAttachments(user.uid, ticketId, (items) => {
      attachments.value = items;
    });
    const unsubscribeTimeline = watchHelpTicketTimeline(user.uid, ticketId, (items) => {
      timeline.value = items;
    });

    cleanup(() => {
      unsubscribeTicket();
      unsubscribeAttachments();
      unsubscribeTimeline();
    });
  });

  if (loading.value) {
    return <p class="ui-help-ticket-empty">{t(i18n, 'loadingLabel', 'Loading...')}</p>;
  }

  const currentTicket = ticket.value;
  if (!currentTicket) {
    return (
      <div class="ui-help-detail-root">
        <button type="button" class="ui-help-detail-back" onClick$={goBack$}>
          <span class="material-icons-outlined" aria-hidden="true">
            arrow_back
          </span>
          <span>{t(i18n, 'helpTicketsTitle', 'Tickets')}</span>
        </button>
        <p class="ui-help-ticket-empty">{t(i18n, 'helpTicketNotFound', "This ticket doesn't exist anymore.")}</p>
      </div>
    );
  }

  const title = currentTicket.title?.trim() || t(i18n, 'helpTicketGeneratedTitleGeneric', 'Support request');

  return (
    <div class="ui-help-detail-root">
      <button type="button" class="ui-help-detail-back" onClick$={goBack$}>
        <span class="material-icons-outlined" aria-hidden="true">
          arrow_back
        </span>
        <span>{t(i18n, 'helpTicketsTitle', 'Tickets')}</span>
      </button>

      <section class="ui-help-card">
        <h2 class="ui-help-card-title">{title}</h2>
        <p class="ui-help-progress-status">
          {delivererStatusLabel(currentTicket.delivererStatus, currentTicket.delivererStatus, (key, fallbackText) =>
            t(i18n, key, fallbackText),
          )}
        </p>
        <p class="ui-help-ticket-date">
          {t(i18n, 'helpStatusUpdatedLabel', 'Status updated')}: {formatHelpDate(currentTicket.updatedAt)}
        </p>
        <p class="ui-help-ticket-desc">
          {currentTicket.delivererStatusMessage ||
            statusLabel(currentTicket.status, currentTicket.status, (key, fallbackText) =>
              t(i18n, key, fallbackText),
            )}
        </p>
      </section>

      <section class="ui-help-card">
        <h2 class="ui-help-section-title">{t(i18n, 'helpTicketDescriptionTitle', 'Description')}</h2>
        <p class="ui-help-ticket-desc">
          {currentTicket.description || t(i18n, 'helpTicketDescriptionEmpty', 'No description provided.')}
        </p>
      </section>

      <section class="ui-help-card">
        <h2 class="ui-help-section-title">{t(i18n, 'helpTicketAttachmentsTitle', 'Attachments')}</h2>
        <ul class="ui-help-ticket-list">
          {attachments.value.length === 0 ? (
            <li class="ui-help-ticket-empty">{t(i18n, 'helpAttachmentEmptyState', 'No attachments yet.')}</li>
          ) : null}
          {attachments.value.map((attachment) => (
            <li key={attachment.id} class="ui-help-ticket-item">
              <a class="ui-help-attachment-link" href={attachment.url} target="_blank" rel="noreferrer">
                <div class="ui-help-ticket-row">
                  <span class="ui-help-ticket-id">
                    {attachment.type === 'audio'
                      ? t(i18n, 'helpAudioAttachmentLabel', 'Voice note')
                      : attachment.filename}
                  </span>
                  <span class="ui-help-ticket-status">
                    {attachment.type === 'audio' ? 'AUDIO' : 'IMAGE'}
                  </span>
                </div>
                <p class="ui-help-ticket-date">{attachment.filename}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section class="ui-help-card">
        <h2 class="ui-help-section-title">{t(i18n, 'helpTicketTimelineTitle', 'Status history')}</h2>
        <ul class="ui-help-timeline-list">
          {timeline.value.length === 0 ? (
            <li class="ui-help-ticket-empty">{t(i18n, 'helpTicketTimelineEmpty', 'No status history yet.')}</li>
          ) : null}
          {timeline.value.map((event) => (
            <li key={event.id} class="ui-help-timeline-item">
              <div class="ui-help-ticket-row">
                <span class="ui-help-ticket-status">
                  {statusLabel(event.status, event.status, (key, fallbackText) => t(i18n, key, fallbackText))}
                </span>
                <span class="ui-help-ticket-date">{formatHelpDate(event.at)}</span>
              </div>
              <p class="ui-help-ticket-desc">{event.message}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
});
