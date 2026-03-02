import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { ErrorBanner, LoadingPanel } from '../../../../components/ui/page-state';
import { callAdminGetUserSnapshot } from '../../../../lib/firebase/callables-admin';
import { getAdminTicketPath } from '../../../../lib/routes/admin-routes';
import type { AdminUserSnapshotResponse } from '../../../../lib/types/admin';
import { formatCurrency, formatDateTime, formatNumber } from '../../../../lib/utils/format';
import { IconLabel } from '../../../../components/ui/icon-label';

const readUidFromQuery = (url: URL): string => url.searchParams.get('uid')?.trim() ?? '';
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
  const data = useSignal<AdminUserSnapshotResponse | null>(null);
  const resolvedUid = useSignal('');

  const loadSnapshot$ = $(async () => {
    const uid = readUidFromQuery(resolveRuntimeUrl(location.url));
    resolvedUid.value = uid;
    if (!uid) {
      loading.value = false;
      data.value = null;
      error.value = 'Missing user id in URL.';
      return;
    }

    loading.value = true;
    error.value = '';
    try {
      data.value = await callAdminGetUserSnapshot({
        uid,
        includeSensitive: includeSensitive.value,
      });
    } catch (err) {
      data.value = null;
      error.value = err instanceof Error ? err.message : 'Failed to load user snapshot.';
    } finally {
      loading.value = false;
    }
  });

  useVisibleTask$(async ({ track }) => {
    track(() => includeSensitive.value);
    track(() => location.url.search);
    await loadSnapshot$();
  });

  return (
    <>
      <header class="admin-header">
        <div>
          <h1 class="admin-page-title">User snapshot</h1>
          <p class="admin-page-subtitle">{resolvedUid.value || 'Missing user id'}</p>
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
      {loading.value && <LoadingPanel message="Loading user snapshot…" />}

      {!loading.value && data.value && (
        <div class="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
          <article class="admin-card">
            <h3><IconLabel icon="person" text="Profile" /></h3>
            <p><strong>UID:</strong> {data.value.user.uid}</p>
            <p><strong>Email:</strong> {data.value.user.email ?? data.value.user.emailMasked ?? '—'}</p>
            <p><strong>Created:</strong> {formatDateTime(data.value.user.createdAtIso)}</p>
            <p><strong>Last activity:</strong> {formatDateTime(data.value.user.lastActivityAtIso)}</p>
            <p><strong>Locale:</strong> {data.value.user.preferredLocale ?? '—'}</p>
          </article>

          <article class="admin-card">
            <h3><IconLabel icon="workspace_premium" text="Entitlement" /></h3>
            <p><strong>Plan:</strong> {data.value.entitlement.planId ?? '—'}</p>
            <p><strong>Status:</strong> {data.value.entitlement.status ?? '—'}</p>
            <p><strong>Limit:</strong> {formatNumber(data.value.entitlement.offerLimit)}</p>
            <p><strong>Usage period:</strong> {data.value.usage.periodKey ?? '—'}</p>
            <p><strong>Offers used:</strong> {formatNumber(data.value.usage.offerCount)}</p>
          </article>

          <article class="admin-card">
            <h3><IconLabel icon="devices" text="Devices" /></h3>
            {data.value.devices.length === 0 && <p class="admin-muted">No devices found.</p>}
            {data.value.devices.map((device) => (
              <p key={device.deviceId}>
                {device.deviceId} ({device.platform ?? 'unknown'}) {device.active ? 'active' : 'inactive'}
              </p>
            ))}
          </article>

          <article class="admin-card" style={{ gridColumn: '1 / -1' }}>
            <h3><IconLabel icon="history" text="Recent offers" /></h3>
            {data.value.recentOffers.length === 0 && <p class="admin-muted">No offers found.</p>}
            {data.value.recentOffers.map((offer) => (
              <p key={offer.offerId}>
                {formatDateTime(offer.createdAtIso)} · {formatCurrency(offer.netProfitEuro)} · {offer.source ?? 'unknown'}
              </p>
            ))}
          </article>

          <article class="admin-card" style={{ gridColumn: '1 / -1' }}>
            <h3><IconLabel icon="support_agent" text="Recent tickets" /></h3>
            {data.value.recentTickets.length === 0 && <p class="admin-muted">No tickets found.</p>}
            {data.value.recentTickets.map((ticket) => (
              <p key={ticket.ticketId}>
                {formatDateTime(ticket.updatedAtIso)} · {ticket.status ?? 'unknown'} ·{' '}
                <a href={getAdminTicketPath(ticket.uid, ticket.ticketId)}>{ticket.ticketId}</a>
              </p>
            ))}
          </article>
        </div>
      )}
    </>
  );
});
