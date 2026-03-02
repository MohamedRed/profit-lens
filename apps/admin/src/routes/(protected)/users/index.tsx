import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { callAdminListUsers } from '../../../lib/firebase/callables-admin';
import { getAdminUserPath } from '../../../lib/routes/admin-routes';
import type { AdminSortDir, AdminUserRow, AdminUsersSortBy } from '../../../lib/types/admin';
import { ErrorBanner, EmptyPanel, LoadingPanel } from '../../../components/ui/page-state';
import { formatDateTime, formatNumber } from '../../../lib/utils/format';

export default component$(() => {
  const query = useSignal('');
  const sortBy = useSignal<AdminUsersSortBy>('lastActivityAt');
  const sortDir = useSignal<AdminSortDir>('desc');
  const rows = useSignal<AdminUserRow[]>([]);
  const nextCursor = useSignal<string | null>(null);
  const loading = useSignal(true);
  const loadingMore = useSignal(false);
  const error = useSignal('');

  const loadUsers$ = $(async (append: boolean) => {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }
    error.value = '';

    try {
      const payload = {
        query: query.value.trim() || undefined,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
        pageSize: 20,
        cursor: append ? nextCursor.value ?? undefined : undefined,
      };
      const response = await callAdminListUsers(payload);
      rows.value = append ? [...rows.value, ...response.rows] : response.rows;
      nextCursor.value = response.nextCursor;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load users.';
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  });

  useVisibleTask$(async () => {
    await loadUsers$(false);
  });

  return (
    <>
      <header class="admin-header">
        <div>
          <h1 class="admin-page-title">Users directory</h1>
          <p class="admin-page-subtitle">Masked by default. Open a row for full snapshot.</p>
        </div>
      </header>

      <section class="admin-card admin-toolbar">
        <label class="admin-field" style={{ minWidth: '250px' }}>
          <span>Search</span>
          <input
            type="text"
            placeholder="Search by uid or masked email"
            value={query.value}
            onInput$={(_, target) => {
              query.value = target.value;
            }}
          />
        </label>

        <label class="admin-field">
          <span>Sort by</span>
          <select
            value={sortBy.value}
            onChange$={(_, target) => {
              sortBy.value = target.value as AdminUsersSortBy;
            }}
          >
            <option value="lastActivityAt">Last activity</option>
            <option value="createdAt">Created at</option>
            <option value="offerCount30d">Offer count (30d)</option>
          </select>
        </label>

        <label class="admin-field">
          <span>Direction</span>
          <select
            value={sortDir.value}
            onChange$={(_, target) => {
              sortDir.value = target.value as AdminSortDir;
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>

        <button class="admin-button" onClick$={async () => await loadUsers$(false)}>
          Apply filters
        </button>
      </section>

      {error.value && <ErrorBanner message={error.value} />}
      {loading.value && <LoadingPanel message="Loading users…" />}

      {!loading.value && rows.value.length === 0 && <EmptyPanel message="No users found for current filters." />}

      {!loading.value && rows.value.length > 0 && (
        <section class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Created</th>
                <th>Last activity</th>
                <th>Offers (30d)</th>
                <th>Tickets (30d)</th>
                <th>Entitlement</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.value.map((row) => (
                <tr key={row.uid}>
                  <td>
                    <div><strong>{row.uid}</strong></div>
                    <div class="admin-muted">{row.emailMasked ?? '—'}</div>
                  </td>
                  <td>{formatDateTime(row.createdAtIso)}</td>
                  <td>{formatDateTime(row.lastActivityAtIso)}</td>
                  <td>{formatNumber(row.offerCount30d)}</td>
                  <td>{formatNumber(row.helpTicketCount30d)}</td>
                  <td>
                    <span class="admin-chip">
                      {row.entitlementPlanId ?? 'unknown'} · {row.entitlementStatus ?? 'unknown'}
                    </span>
                  </td>
                  <td>
                    <a href={getAdminUserPath(row.uid)} class="admin-button secondary" style={{ display: 'inline-block' }}>
                      Open
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {nextCursor.value && (
        <div>
          <button class="admin-button secondary" disabled={loadingMore.value} onClick$={async () => await loadUsers$(true)}>
            {loadingMore.value ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
});
