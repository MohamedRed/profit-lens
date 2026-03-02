import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { ErrorBanner, LoadingPanel } from '../../../../components/ui/page-state';
import { callAdminGetHelpTicketDetail } from '../../../../lib/firebase/callables-admin';
import type { AdminGetHelpTicketDetailResponse } from '../../../../lib/types/admin';
import { formatDateTime, formatNumber } from '../../../../lib/utils/format';
import { useLocation } from '@builder.io/qwik-city';

const readTicketParamsFromQuery = (url: URL): { uid: string; ticketId: string } => ({
  uid: url.searchParams.get('uid')?.trim() ?? '',
  ticketId: url.searchParams.get('ticketId')?.trim() ?? '',
});
const resolveRuntimeUrl = (fallback: URL): URL => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  return new URL(window.location.href);
};

export default component$(() => {
  const location = useLocation();
  const includeSensitive = useSignal(false);
  const loading = useSignal(true);
  const error = useSignal('');
  const data = useSignal<AdminGetHelpTicketDetailResponse | null>(null);
  const resolvedParams = useSignal({ uid: '', ticketId: '' });

  useVisibleTask$(async ({ track }) => {
    track(() => includeSensitive.value);
    track(() => location.url.search);
    const { uid, ticketId } = readTicketParamsFromQuery(resolveRuntimeUrl(location.url));
    resolvedParams.value = { uid, ticketId };

    if (!uid || !ticketId) {
      loading.value = false;
      data.value = null;
      error.value = 'Missing ticket identifiers in URL.';
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      data.value = await callAdminGetHelpTicketDetail({
        uid,
        ticketId,
        includeSensitive: includeSensitive.value,
      });
    } catch (err) {
      data.value = null;
      error.value = err instanceof Error ? err.message : 'Failed to load ticket details.';
    } finally {
      loading.value = false;
    }
  });

  return (
    <>
      <header class="admin-header">
        <div>
          <h1 class="admin-page-title">Ticket detail</h1>
          <p class="admin-page-subtitle">
            {resolvedParams.value.uid && resolvedParams.value.ticketId
              ? `${resolvedParams.value.uid} / ${resolvedParams.value.ticketId}`
              : 'Missing ticket id'}
          </p>
        </div>

        <label class="admin-field" style={{ minWidth: '180px' }}>
          <span>PII mode</span>
          <select
            value={includeSensitive.value ? 'sensitive' : 'masked'}
            onChange$={(_, target) => {
              includeSensitive.value = target.value === 'sensitive';
            }}
          >
            <option value="masked">Masked</option>
            <option value="sensitive">Sensitive detail</option>
          </select>
        </label>
      </header>

      {error.value && <ErrorBanner message={error.value} />}
      {loading.value && <LoadingPanel message="Loading ticket details…" />}

      {!loading.value && data.value && (
        <div class="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
          <article class="admin-card" style={{ gridColumn: '1 / -1' }}>
            <h3>Ticket</h3>
            <p><strong>Title:</strong> {data.value.ticket.title ?? '—'}</p>
            <p><strong>Status:</strong> {data.value.ticket.status ?? '—'}</p>
            <p><strong>Deliverer status:</strong> {data.value.ticket.delivererStatus ?? '—'}</p>
            <p><strong>Message:</strong> {data.value.ticket.delivererStatusMessage ?? '—'}</p>
            <p><strong>User:</strong> {data.value.ticket.email ?? data.value.ticket.emailMasked ?? '—'}</p>
            <p><strong>Created:</strong> {formatDateTime(data.value.ticket.createdAtIso)}</p>
            <p><strong>Updated:</strong> {formatDateTime(data.value.ticket.updatedAtIso)}</p>
            <p><strong>Description:</strong> {data.value.ticket.description ?? '—'}</p>
          </article>

          <article class="admin-card">
            <h3>Timeline</h3>
            {data.value.timeline.length === 0 && <p class="admin-muted">No timeline events.</p>}
            {data.value.timeline.map((event) => (
              <p key={event.id}>
                <strong>{event.status ?? 'unknown'}</strong> · {formatDateTime(event.atIso)}
                <br />
                <span class="admin-muted">{event.message ?? '—'} ({event.source ?? 'unknown'})</span>
              </p>
            ))}
          </article>

          <article class="admin-card">
            <h3>Attachments</h3>
            {data.value.attachments.length === 0 && <p class="admin-muted">No attachments.</p>}
            {data.value.attachments.map((attachment) => (
              <p key={attachment.id}>
                <strong>{attachment.type}</strong> · {attachment.filename ?? 'unnamed'}
                <br />
                <span class="admin-muted">
                  {attachment.contentType ?? 'n/a'} · {formatNumber(attachment.sizeBytes)} bytes · {formatDateTime(attachment.uploadedAtIso)}
                </span>
              </p>
            ))}
          </article>
        </div>
      )}
    </>
  );
});
