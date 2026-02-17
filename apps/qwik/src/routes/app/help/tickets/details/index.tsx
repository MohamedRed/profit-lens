import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import {
  HelpTicketDetailSkeleton,
  LoadingSkeletonAnnouncer,
} from '../../../../../components/ui/page-loading-skeleton';
import { useAuth } from '../../../../../lib/auth/auth-context';
import { readHelpTicketId } from '../../../../../lib/features/help/help-ticket-id';
import {
  readSelectedHelpTicketId,
  saveSelectedHelpTicketId,
} from '../../../../../lib/features/help/help-ticket-selection';
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
import { resolveUserFacingErrorMessage } from '../../../../../lib/errors/user-facing-error';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { HelpTicket, HelpTicketAttachment, HelpTicketTimelineEvent } from '../../../../../lib/types/help';
import { HelpTicketAttachmentList } from '../../components/help-ticket-attachment-list';
import { HelpTicketProgressStepper } from '../../components/help-ticket-progress-stepper';

export default component$(() => {
  const location = useLocation();
  const auth = useAuth();
  const i18n = useI18n();

  const loading = useSignal(true);
  const ticket = useSignal<HelpTicket | null>(null);
  const attachments = useSignal<HelpTicketAttachment[]>([]);
  const timeline = useSignal<HelpTicketTimelineEvent[]>([]);
  const loadError = useSignal('');

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    const ticketParam = track(() => location.params.ticketId);
    const path = track(() => location.url.pathname);
    const search = track(() => location.url.search);
    const hash = track(() => location.url.hash);
    const ticketId = readHelpTicketId(ticketParam, path, search, hash) ?? readSelectedHelpTicketId();

    if (!user || !ticketId) {
      loading.value = false;
      ticket.value = null;
      attachments.value = [];
      timeline.value = [];
      loadError.value = '';
      return;
    }

    saveSelectedHelpTicketId(ticketId);
    loading.value = true;
    loadError.value = '';
    const unsubscribeTicket = watchHelpTicket(user.uid, ticketId, (value) => {
      ticket.value = value;
      loading.value = false;
    }, (error) => {
      ticket.value = null;
      attachments.value = [];
      timeline.value = [];
      loading.value = false;
      loadError.value = resolveUserFacingErrorMessage(i18n, error, 'help-load');
    });
    const unsubscribeAttachments = watchHelpTicketAttachments(user.uid, ticketId, (items) => {
      attachments.value = items;
    }, () => {
      attachments.value = [];
    });
    const unsubscribeTimeline = watchHelpTicketTimeline(user.uid, ticketId, (items) => {
      timeline.value = items;
    }, () => {
      timeline.value = [];
    });

    cleanup(() => {
      unsubscribeTicket();
      unsubscribeAttachments();
      unsubscribeTimeline();
    });
  });

  if (loading.value) {
    return (
      <div aria-busy="true">
        <LoadingSkeletonAnnouncer label={t(i18n, 'loadingLabel', 'Loading...')} />
        <HelpTicketDetailSkeleton />
      </div>
    );
  }

  const currentTicket = ticket.value;
  if (!currentTicket) {
    return (
      <div class="ui-help-detail-root">
        {loadError.value ? <p class="ui-help-ticket-empty ui-status-error">{loadError.value}</p> : null}
        <p class="ui-help-ticket-empty">{t(i18n, 'helpTicketNotFound', "This ticket doesn't exist anymore.")}</p>
      </div>
    );
  }

  const title = currentTicket.title?.trim() || t(i18n, 'helpTicketGeneratedTitleGeneric', 'Support request');

  return (
    <div class="ui-help-detail-root">
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
        <HelpTicketAttachmentList attachments={attachments.value} />
      </section>

      <section class="ui-help-card">
        <h2 class="ui-help-section-title">{t(i18n, 'helpTicketProgressTitle', 'Progress')}</h2>
        <HelpTicketProgressStepper currentStatus={currentTicket.delivererStatus} events={timeline.value} />
      </section>
    </div>
  );
});
