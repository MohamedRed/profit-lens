import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../lib/auth/auth-context';
import { getDeviceId } from '../../../lib/config/device-id';
import { createHelpTicket, watchHelpTickets } from '../../../lib/features/help/help-service';
import { buildHelpDrafts, formatHelpDate, maxHelpAttachments, statusLabel } from '../../../lib/features/help/help-ui-utils';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { HelpAttachmentDraft, HelpTicket } from '../../../lib/types/help';

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();

  const description = useSignal('');
  const drafts = useSignal<HelpAttachmentDraft[]>([]);
  const submitting = useSignal(false);
  const showTickets = useSignal(false);
  const tickets = useSignal<HelpTicket[]>([]);
  const status = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    const visible = track(() => showTickets.value);
    if (!user || !visible) {
      tickets.value = [];
      return;
    }

    const unsubscribe = watchHelpTickets(user.uid, (nextTickets) => {
      tickets.value = nextTickets;
    });

    cleanup(() => {
      unsubscribe();
    });
  });

  return (
    <div class="ui-help-root">
      <div class="ui-help-toolbar">
        <button
          type="button"
          class={{ 'ui-help-toolbar-btn': true, 'is-active': showTickets.value }}
          onClick$={() => {
            showTickets.value = !showTickets.value;
          }}
          aria-label={t(i18n, 'helpViewTicketsButton', 'View tickets')}
        >
          <span class="material-icons-outlined" aria-hidden="true">
            list_alt
          </span>
        </button>
      </div>

      <section class="ui-help-card">
        <h2 class="ui-help-card-title">{t(i18n, 'helpIntroTitle', 'Get help quickly')}</h2>
        <div class="ui-help-intro-row">
          <span class="material-icons-outlined ui-help-intro-icon" aria-hidden="true">
            support_agent
          </span>
          <p class="ui-help-intro-copy">
            {t(
              i18n,
              'helpIntroBody',
              'Report bugs or issues with screenshots and a written description. Our team will analyze and keep you informed.',
            )}
          </p>
        </div>
      </section>

      <section class="ui-help-card">
        <h2 class="ui-help-card-title">{t(i18n, 'helpFormTitle', 'Submit a ticket')}</h2>

        <textarea
          class="ui-help-textarea"
          value={description.value}
          placeholder={t(i18n, 'helpDescriptionLabel', 'Describe the issue')}
          onInput$={(_, el) => {
            description.value = el.value;
          }}
        />

        <div class="ui-help-attachments-head">
          <p class="ui-help-attachments-title">{t(i18n, 'helpAttachmentTitle', 'Screenshots')}</p>
          <p class="ui-help-attachments-subtitle">
            {t(i18n, 'helpAttachmentSubtitle', 'Add screenshots to speed up diagnosis.')}
          </p>
        </div>

        <label class="ui-help-gallery-btn">
          <span class="material-icons-outlined ui-help-gallery-icon" aria-hidden="true">
            image
          </span>
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
              const nextDrafts = [...drafts.value, ...buildHelpDrafts(files)].slice(0, maxHelpAttachments);
              drafts.value = nextDrafts;
              if (nextDrafts.length === maxHelpAttachments) {
                status.value = t(i18n, 'helpAttachmentLimitReached', 'Attachment limit reached.');
              }
              element.value = '';
            }}
          />
        </label>

        {drafts.value.length > 0 ? (
          <ul class="ui-help-attachment-list">
            {drafts.value.map((item, index) => (
              <li key={`${item.filename}-${index}`} class="ui-help-attachment-item">
                <span class="ui-help-attachment-name">{item.filename}</span>
                <button
                  type="button"
                  class="ui-help-attachment-remove"
                  onClick$={() => {
                    drafts.value = drafts.value.filter((_, itemIndex) => itemIndex !== index);
                  }}
                >
                  <span class="material-icons-outlined" aria-hidden="true">
                    close
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <button
          type="button"
          class="ui-help-submit"
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

            status.value = '';
            submitting.value = true;
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
          {submitting.value
            ? t(i18n, 'helpSubmittingLabel', 'Submitting...')
            : t(i18n, 'helpSubmitButton', 'Submit ticket')}
        </button>

        {status.value ? (
          <p
            class={{
              'ui-status': true,
              'ui-status-success': status.value.toLowerCase().includes('ticket'),
              'ui-status-error': !status.value.toLowerCase().includes('ticket'),
            }}
          >
            {status.value}
          </p>
        ) : null}
      </section>

      {showTickets.value ? (
        <section class="ui-help-card">
          <h2 class="ui-help-card-title">{t(i18n, 'helpTicketsTitle', 'Tickets')}</h2>
          <ul class="ui-help-ticket-list">
            {tickets.value.length === 0 ? (
              <li class="ui-help-ticket-empty">
                {t(i18n, 'helpNoTicketsMessage', 'No tickets yet.')}
              </li>
            ) : null}
            {tickets.value.map((ticket) => (
              <li key={ticket.id} class="ui-help-ticket-item">
                <div class="ui-help-ticket-row">
                  <span class="ui-help-ticket-id">#{ticket.id.slice(0, 8)}</span>
                  <span class="ui-help-ticket-status">
                    {statusLabel(ticket.status, ticket.status, (key, fallbackText) =>
                      t(i18n, key, fallbackText),
                    )}
                  </span>
                </div>
                <p class="ui-help-ticket-desc">
                  {ticket.description || t(i18n, 'helpTicketDescriptionEmpty', 'No description provided.')}
                </p>
                <p class="ui-help-ticket-date">
                  {t(i18n, 'helpStatusUpdatedLabel', 'Status updated')}: {formatHelpDate(ticket.updatedAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
});
