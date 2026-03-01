import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { ErrorBanner, EmptyPanel, LoadingPanel } from '../../../components/ui/page-state';
import { callAdminListOffers } from '../../../lib/firebase/callables-admin';
import type {
  AdminOfferRow,
  AdminOfferSource,
  AdminProfitabilityFilter,
} from '../../../lib/types/admin';
import { formatCurrency, formatDateTime, formatNumber } from '../../../lib/utils/format';

export default component$(() => {
  const uid = useSignal('');
  const source = useSignal<'all' | AdminOfferSource>('all');
  const profitability = useSignal<'all' | AdminProfitabilityFilter>('all');
  const rows = useSignal<AdminOfferRow[]>([]);
  const nextCursor = useSignal<string | null>(null);
  const loading = useSignal(true);
  const loadingMore = useSignal(false);
  const error = useSignal('');

  const loadOffers$ = $(async (append: boolean) => {
    if (append) {
      loadingMore.value = true;
    } else {
      loading.value = true;
    }
    error.value = '';

    try {
      const response = await callAdminListOffers({
        uid: uid.value.trim() || undefined,
        source: source.value === 'all' ? undefined : source.value,
        profitability: profitability.value === 'all' ? undefined : profitability.value,
        pageSize: 20,
        cursor: append ? nextCursor.value ?? undefined : undefined,
      });
      rows.value = append ? [...rows.value, ...response.rows] : response.rows;
      nextCursor.value = response.nextCursor;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load offers.';
    } finally {
      loading.value = false;
      loadingMore.value = false;
    }
  });

  useVisibleTask$(async () => {
    await loadOffers$(false);
  });

  return (
    <>
      <header class="admin-header">
        <div>
          <h1 class="admin-page-title">Offers explorer</h1>
          <p class="admin-page-subtitle">Pickup/dropoff are city-level summaries in list mode.</p>
        </div>
      </header>

      <section class="admin-card admin-toolbar">
        <label class="admin-field">
          <span>UID</span>
          <input
            type="text"
            placeholder="Optional uid"
            value={uid.value}
            onInput$={(_, target) => {
              uid.value = target.value;
            }}
          />
        </label>

        <label class="admin-field">
          <span>Source</span>
          <select
            value={source.value}
            onChange$={(_, target) => {
              source.value = target.value as 'all' | AdminOfferSource;
            }}
          >
            <option value="all">All</option>
            <option value="manual">Manual</option>
            <option value="screenshot">Screenshot</option>
          </select>
        </label>

        <label class="admin-field">
          <span>Profitability</span>
          <select
            value={profitability.value}
            onChange$={(_, target) => {
              profitability.value = target.value as 'all' | AdminProfitabilityFilter;
            }}
          >
            <option value="all">All</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
          </select>
        </label>

        <button class="admin-button" onClick$={async () => await loadOffers$(false)}>
          Apply filters
        </button>
      </section>

      {error.value && <ErrorBanner message={error.value} />}
      {loading.value && <LoadingPanel message="Loading offers…" />}

      {!loading.value && rows.value.length === 0 && <EmptyPanel message="No offers found for current filters." />}

      {!loading.value && rows.value.length > 0 && (
        <section class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>UID</th>
                <th>Offer</th>
                <th>Created</th>
                <th>Source</th>
                <th>Payout</th>
                <th>Net profit</th>
                <th>Distance</th>
                <th>Pickup</th>
                <th>Dropoff</th>
              </tr>
            </thead>
            <tbody>
              {rows.value.map((row) => (
                <tr key={`${row.uid}-${row.offerId}`}>
                  <td>{row.uid}</td>
                  <td>{row.offerId}</td>
                  <td>{formatDateTime(row.createdAtIso)}</td>
                  <td>{row.source ?? '—'}</td>
                  <td>{formatCurrency(row.payoutEuro)}</td>
                  <td>{formatCurrency(row.netProfitEuro)}</td>
                  <td>{formatNumber(row.distanceKm)}</td>
                  <td>{row.pickupSummary ?? '—'}</td>
                  <td>{row.dropoffSummary ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {nextCursor.value && (
        <div>
          <button class="admin-button secondary" disabled={loadingMore.value} onClick$={async () => await loadOffers$(true)}>
            {loadingMore.value ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
});
