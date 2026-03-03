import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { callAdminGetOverview } from '../../lib/firebase/callables-admin';
import type { AdminGetOverviewResponse, AdminRangeDays } from '../../lib/types/admin';
import { formatDayLabel, formatNumber, formatPercentDelta } from '../../lib/utils/format';
import { ErrorBanner, LoadingPanel } from '../../components/ui/page-state';
import { IconLabel } from '../../components/ui/icon-label';
import { MultiLineChart } from '../../components/charts/multi-line-chart';

const rangeOptions: AdminRangeDays[] = [7, 30, 90];
const defaultRangeDays: AdminRangeDays = 30;

export default component$(() => {
  const rangeDays = useSignal<AdminRangeDays>(defaultRangeDays);
  const loading = useSignal(true);
  const error = useSignal('');
  const data = useSignal<AdminGetOverviewResponse | null>(null);
  const activeRequestId = useSignal(0);

  useVisibleTask$(async ({ track }) => {
    track(() => rangeDays.value);
    const requestId = activeRequestId.value + 1;
    activeRequestId.value = requestId;
    loading.value = true;
    error.value = '';

    try {
      const response = await callAdminGetOverview({ rangeDays: rangeDays.value });
      if (requestId !== activeRequestId.value) {
        return;
      }
      data.value = response;
      if (rangeDays.value !== response.rangeDays) {
        rangeDays.value = response.rangeDays;
      }
    } catch (err) {
      if (requestId !== activeRequestId.value) {
        return;
      }
      error.value = err instanceof Error ? err.message : 'Failed to load overview.';
    } finally {
      if (requestId === activeRequestId.value) {
        loading.value = false;
      }
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
          <span><IconLabel icon="calendar_month" text="Range" size="sm" /></span>
          <select
            value={String(data.value?.rangeDays ?? rangeDays.value)}
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
              <h4><IconLabel icon="group" text="Total users" /></h4>
              <div class="admin-kpi-value">{formatNumber(data.value.kpis.totalUsers)}</div>
              <div class={{ 'admin-kpi-delta': true, [data.value.deltas.activeUsersInRange.trend]: true }}>
                Active users {formatPercentDelta(data.value.deltas.activeUsersInRange.percentChange)}
              </div>
            </article>

            <article class="admin-card">
              <h4><IconLabel icon="local_shipping" text="Offers in range" /></h4>
              <div class="admin-kpi-value">{formatNumber(data.value.kpis.offersInRange)}</div>
              <div class={{ 'admin-kpi-delta': true, [data.value.deltas.offersInRange.trend]: true }}>
                {formatPercentDelta(data.value.deltas.offersInRange.percentChange)} vs previous period
              </div>
            </article>

            <article class="admin-card">
              <h4><IconLabel icon="trending_up" text="Profitability split" /></h4>
              <div class="admin-kpi-value">
                {formatNumber(data.value.kpis.positiveOffersInRange)} / {formatNumber(data.value.kpis.negativeOffersInRange)}
              </div>
              <div class="admin-kpi-delta">Positive / negative offers</div>
            </article>

            <article class="admin-card">
              <h4><IconLabel icon="support_agent" text="Ticket states" /></h4>
              <div class="admin-kpi-value">
                {formatNumber(data.value.kpis.openTicketsInRange)} / {formatNumber(data.value.kpis.resolvedTicketsInRange)}
              </div>
              <div class={{ 'admin-kpi-delta': true, [data.value.deltas.ticketsInRange.trend]: true }}>
                {formatPercentDelta(data.value.deltas.ticketsInRange.percentChange)} total tickets
              </div>
            </article>
          </section>

          <section class="admin-grid admin-overview-charts">
            <article class="admin-card">
              <div class="admin-chart-card-head">
                <h3><IconLabel icon="insights" text="Demand trend" /></h3>
                <p class="admin-page-subtitle">Daily offers compared to active users.</p>
              </div>

              <MultiLineChart
                labels={data.value.series.map((point) => formatDayLabel(point.dateIso))}
                series={[
                  {
                    id: 'offers',
                    label: 'Offers',
                    color: 'var(--admin-chart-primary)',
                    showArea: true,
                    values: data.value.series.map((point) => point.offers),
                  },
                  {
                    id: 'active-users',
                    label: 'Active users',
                    color: 'var(--admin-chart-secondary)',
                    values: data.value.series.map((point) => point.activeUsers),
                  },
                ]}
                emptyMessage="No demand data available in this range."
              />
            </article>

            <article class="admin-card">
              <div class="admin-chart-card-head">
                <h3><IconLabel icon="trending_up" text="Profitability trend" /></h3>
                <p class="admin-page-subtitle">Positive vs negative offers by day.</p>
              </div>

              <MultiLineChart
                labels={data.value.series.map((point) => formatDayLabel(point.dateIso))}
                series={[
                  {
                    id: 'positive-offers',
                    label: 'Positive offers',
                    color: 'var(--admin-chart-success)',
                    showArea: true,
                    values: data.value.series.map((point) => point.positiveOffers),
                  },
                  {
                    id: 'negative-offers',
                    label: 'Negative offers',
                    color: 'var(--admin-chart-danger)',
                    values: data.value.series.map((point) => point.negativeOffers),
                  },
                ]}
                emptyMessage="No profitability data available in this range."
              />
            </article>

            <article class="admin-card">
              <div class="admin-chart-card-head">
                <h3><IconLabel icon="support_agent" text="Support load" /></h3>
                <p class="admin-page-subtitle">Open and resolved ticket activity over time.</p>
              </div>

              <MultiLineChart
                labels={data.value.series.map((point) => formatDayLabel(point.dateIso))}
                series={[
                  {
                    id: 'open-tickets',
                    label: 'Open tickets',
                    color: 'var(--admin-chart-warning)',
                    showArea: true,
                    values: data.value.series.map((point) => point.openTickets),
                  },
                  {
                    id: 'resolved-tickets',
                    label: 'Resolved tickets',
                    color: 'var(--admin-chart-info)',
                    values: data.value.series.map((point) => point.resolvedTickets),
                  },
                ]}
                emptyMessage="No ticket data available in this range."
              />
            </article>
          </section>

          <section class="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }}>
            <article class="admin-card">
              <h3><IconLabel icon="workspace_premium" text="Entitlements" /></h3>
              <p class="admin-muted" style={{ margin: 0 }}>
                Paid users: {formatNumber(data.value.kpis.paidUsers)}
              </p>
              <p class="admin-muted" style={{ margin: '6px 0 0' }}>
                Free users: {formatNumber(data.value.kpis.freeUsers)}
              </p>
            </article>

            <article class="admin-card">
              <h3><IconLabel icon="schedule" text="Generated at" /></h3>
              <p class="admin-muted" style={{ margin: 0 }}>{new Date(data.value.generatedAtIso).toLocaleString()}</p>
            </article>
          </section>
        </>
      )}
    </>
  );
});
