import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { ErrorBanner, EmptyPanel, LoadingPanel } from '../../../components/ui/page-state';
import { callAdminListHelpTickets } from '../../../lib/firebase/callables-admin';
import { getAdminTicketPath } from '../../../lib/routes/admin-routes';
import type { AdminHelpTicketRow } from '../../../lib/types/admin';
import { formatDateTime } from '../../../lib/utils/format';

export default component$(() => {
  const uid = useSignal('');
  const status = useSignal('');
  const delivererStatus = useSignal('');
  const rows = useSignal<AdminHelpTicketRow[]>([]);
  const nextCursor = useSignal<string | null>(null);
  const counters = useSignal<{ byStatus: Record<string, number>; byDelivererStatus: Record<string, number> }>({
    byStatus: {},
    byDelivererStatus: {},
  });
  const loading = useSignal(true);
  const loadingMore = useSignal(false);
  const error = useSignal('');

  const loadTickets$ = $(async (append: boolean) => {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }
    error.value = '';

    try {
      const response = await callAdminListHelpTickets({
        uid: uid.value.trim() || undefined,
        status: status.value.trim() || undefined,
        delivererStatus: delivererStatus.value.trim() || undefined,
        pageSize: 20,
        cursor: append ? nextCursor.value ?? undefined : undefined,
      });

      rows.value = append ? [...rows.value, ...response.rows] : response.rows;
      counters.value = response.counters;
      nextCursor.value = response.nextCursor;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load tickets.';
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  });

  useVisibleTask$(async () => {
    await loadTickets$(false);
  });

  return (
    <>
      <header class="admin-header">
        <div>
          <h1 class="admin-page-title">Help tickets monitor</h1>
          <p class="admin-page-subtitle">Read-only support ticket feed with masked user identity.</p>
        </div>
      </header>

      <section class="admin-card admin-toolbar">
        <label class="admin-field">
          <span>UID</span>
          <input
            type="text"
            value={uid.value}
            onInput$={(_, target) => {
              uid.value = target.value;
            }}
            placeholder="Optional uid"
          />
        </label>

        <label class="admin-field">
          <span>Status</span>
          <input
            type="text"
            value={status.value}
            onInput$={(_, target) => {
              status.value = target.value;
            }}
            placeholder="open, resolved..."
          />
        </label>

        <label class="admin-field">
          <span>Deliverer status</span>
          <input
            type="text"
            value={delivererStatus.value}
            onInput$={(_, target) => {
              delivererStatus.value = target.value;
            }}
            placeholder="received, analyzing..."
          />
        </label>

        <button class="admin-button" onClick$={async () => await loadTickets$(false)}>
          Apply filters
        </button>
      </section>

      <section class="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
        <article class="admin-card">
          <h4>Status counters</h4>
          {Object.entries(counters.value.byStatus).map(([key, value]) => (
            <p key={key} class="admin-muted">{key}: {value}</p>
          ))}
        </article>

        <article class="admin-card">
          <h4>Deliverer counters</h4>
          {Object.entries(counters.value.byDelivererStatus).map(([key, value]) => (
            <p key={key} class="admin-muted">{key}: {value}</p>
          ))}
        </article>
      </section>

      {error.value && <ErrorBanner message={error.value} />}
      {loading.value && <LoadingPanel message="Loading tickets…" />}

      {!loading.value && rows.value.length === 0 && <EmptyPanel message="No tickets found for current filters." />}

      {!loading.value && rows.value.length > 0 && (
        <section class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>UID</th>
                <th>User</th>
                <th>Status</th>
                <th>Deliverer status</th>
                <th>Created</th>
                <th>Updated</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.value.map((row) => (
                <tr key={`${row.uid}-${row.ticketId}`}>
                  <td>
                    <strong>{row.title ?? row.ticketId}</strong>
                    <div class="admin-muted">{row.descriptionPreview ?? '—'}</div>
                  </td>
                  <td>{row.uid}</td>
                  <td>{row.emailMasked ?? '—'}</td>
                  <td>{row.status ?? '—'}</td>
                  <td>{row.delivererStatus ?? '—'}</td>
                  <td>{formatDateTime(row.createdAtIso)}</td>
                  <td>{formatDateTime(row.updatedAtIso)}</td>
                  <td>
                    <Link
                      href={getAdminTicketPath(row.uid, row.ticketId)}
                      class="admin-button secondary"
                      style={{ display: 'inline-block' }}
                    >
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {nextCursor.value && (
        <div>
          <button class="admin-button secondary" disabled={loadingMore.value} onClick$={async () => await loadTickets$(true)}>
            {loadingMore.value ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
});
