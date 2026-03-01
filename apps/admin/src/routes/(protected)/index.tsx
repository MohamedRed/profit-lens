import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { callAdminGetOverview } from '../../lib/firebase/callables-admin';
import type { AdminGetOverviewResponse, AdminRangeDays } from '../../lib/types/admin';
import { formatNumber, formatPercentDelta } from '../../lib/utils/format';
import { ErrorBanner, LoadingPanel } from '../../components/ui/page-state';

const rangeOptions: AdminRangeDays[] = [7, 30, 90];

export default component$(() => {
  const rangeDays = useSignal<AdminRangeDays>(30);
  const loading = useSignal(true);
  const error = useSignal('');
  const data = useSignal<AdminGetOverviewResponse | null>(null);

  useVisibleTask$(async ({ track }) => {
    track(() => rangeDays.value);
    loading.value = true;
    error.value = '';
    try {
      data.value = await callAdminGetOverview({ rangeDays: rangeDays.value });
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load overview.';
    } finally {
      loading.value = false;
    }
  });

  return (
    <>
      <header class="admin-header">
        <div>
          <h1 class="admin-page-title">Overview</h1>
          <p class="admin-page-subtitle">Operational KPIs for the selected period.</p>
        </div>

        <label class="admin-field" style={{ minWidth: '140px' }}>
          <span>Range</span>
          <select
            value={String(rangeDays.value)}
            onChange$={(_, target) => {
              rangeDays.value = Number(target.value) as AdminRangeDays;
            }}
          >
            {rangeOptions.map((value) => (
              <option key={value} value={String(value)}>{`${value} days`}</option>
            ))}
          </select>
        </label>
      </header>

      {error.value && <ErrorBanner message={error.value} />}
      {loading.value && <LoadingPanel message="Loading overview…" />}

      {!loading.value && data.value && (
        <>
          <section class="admin-grid kpi">
            <article class="admin-card">
              <h4>Total users</h4>
              <div class="admin-kpi-value">{formatNumber(data.value.kpis.totalUsers)}</div>
              <div class={{ 'admin-kpi-delta': true, [data.value.deltas.activeUsersInRange.trend]: true }}>
                Active users {formatPercentDelta(data.value.deltas.activeUsersInRange.percentChange)}
              </div>
            </article>

            <article class="admin-card">
              <h4>Offers in range</h4>
              <div class="admin-kpi-value">{formatNumber(data.value.kpis.offersInRange)}</div>
              <div class={{ 'admin-kpi-delta': true, [data.value.deltas.offersInRange.trend]: true }}>
                {formatPercentDelta(data.value.deltas.offersInRange.percentChange)} vs previous period
              </div>
            </article>

            <article class="admin-card">
              <h4>Profitability split</h4>
              <div class="admin-kpi-value">
                {formatNumber(data.value.kpis.positiveOffersInRange)} / {formatNumber(data.value.kpis.negativeOffersInRange)}
              </div>
              <div class="admin-kpi-delta">Positive / negative offers</div>
            </article>

            <article class="admin-card">
              <h4>Ticket states</h4>
              <div class="admin-kpi-value">
                {formatNumber(data.value.kpis.openTicketsInRange)} / {formatNumber(data.value.kpis.resolvedTicketsInRange)}
              </div>
              <div class={{ 'admin-kpi-delta': true, [data.value.deltas.ticketsInRange.trend]: true }}>
                {formatPercentDelta(data.value.deltas.ticketsInRange.percentChange)} total tickets
              </div>
            </article>
          </section>

          <section class="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
            <article class="admin-card">
              <h3>Entitlements</h3>
              <p class="admin-muted" style={{ margin: 0 }}>
                Paid users: {formatNumber(data.value.kpis.paidUsers)}
              </p>
              <p class="admin-muted" style={{ margin: '6px 0 0' }}>
                Free users: {formatNumber(data.value.kpis.freeUsers)}
              </p>
            </article>

            <article class="admin-card">
              <h3>Generated at</h3>
              <p class="admin-muted" style={{ margin: 0 }}>{new Date(data.value.generatedAtIso).toLocaleString()}</p>
            </article>
          </section>
        </>
      )}
    </>
  );
});
