import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { useAuth } from '../../../../lib/auth/auth-context';
import { saveSelectedHelpTicketId } from '../../../../lib/features/help/help-ticket-selection';
import { watchHelpTickets } from '../../../../lib/features/help/help-service';
import { formatHelpDate, statusLabel } from '../../../../lib/features/help/help-ui-utils';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { HelpTicket } from '../../../../lib/types/help';

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const tickets = useSignal<HelpTicket[]>([]);
  const loading = useSignal(true);
  const loadError = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      tickets.value = [];
      loading.value = false;
      loadError.value = '';
      return;
    }

    loading.value = true;
    loadError.value = '';
    const unsubscribe = watchHelpTickets(user.uid, (nextTickets) => {
      tickets.value = nextTickets;
      loading.value = false;
    }, (error) => {
      tickets.value = [];
      loading.value = false;
      loadError.value =
        error instanceof Error
          ? error.message
          : t(i18n, 'helpTicketLoadFailed', 'Failed to load tickets. Please try again.');
    });

    cleanup(() => {
      unsubscribe();
    });
  });

  if (loading.value) {
    return <p class="ui-help-ticket-empty">{t(i18n, 'loadingLabel', 'Loading...')}</p>;
  }

  return (
    <div class="ui-help-detail-root">
      <Link class="ui-help-detail-back" href="/next/app/help">
        <span class="material-icons-outlined" aria-hidden="true">
          arrow_back
        </span>
        <span>{t(i18n, 'helpTabLabel', 'Help')}</span>
      </Link>

      <section class="ui-help-card">
        <h2 class="ui-help-card-title">{t(i18n, 'helpTicketsTitle', 'Tickets')}</h2>
        {loadError.value ? <p class="ui-help-ticket-empty ui-status-error">{loadError.value}</p> : null}
        <ul class="ui-help-ticket-list">
          {tickets.value.length === 0 ? (
            <li class="ui-help-ticket-empty">{t(i18n, 'helpNoTicketsMessage', 'No tickets yet.')}</li>
          ) : null}
          {tickets.value.map((ticket) => (
            <li key={ticket.id} class="ui-help-ticket-item">
              <Link
                class="ui-help-ticket-link ui-help-ticket-link-button"
                href={`/next/app/help/tickets/details/?ticketId=${encodeURIComponent(ticket.id)}`}
                onClick$={() => {
                  saveSelectedHelpTicketId(ticket.id);
                }}
              >
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
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
});
