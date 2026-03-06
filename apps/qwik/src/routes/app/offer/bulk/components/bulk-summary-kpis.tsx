import { component$ } from '@builder.io/qwik';
import type { CommitBulkOffersImportResponse, ShiftKpi } from '../../../../../lib/types/bulk-offers';
import { formatCurrencyAmount, formatDistanceKm } from '../../../../../lib/i18n/number-format';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkSummaryKpisProps {
  locale: string;
  committed: CommitBulkOffersImportResponse | null;
}

const KpiCard = component$<{ title: string; value: string; detail: string }>(({ title, value, detail }) => {
  return (
    <article class="ui-offer-bulk-kpi-card">
      <p>{title}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
});

const formatKpiValue = (locale: string, kpi: ShiftKpi): string => {
  return formatCurrencyAmount(locale, kpi.netProfitEuro);
};

export const BulkSummaryKpis = component$<BulkSummaryKpisProps>(({ locale, committed }) => {
  const i18n = useI18n();
  if (!committed) {
    return null;
  }
  const dayDistance = formatDistanceKm(locale, committed.kpis.day.distanceKm, t(i18n, 'distanceUnitKm', 'km'));
  const weekDistance = formatDistanceKm(
    locale,
    committed.kpis.rolling7d.distanceKm,
    t(i18n, 'distanceUnitKm', 'km'),
  );

  return (
    <section class="ui-offer-bulk-section">
      <header class="ui-offer-bulk-section-head">
        <h2>{t(i18n, 'bulkKpiTitle', 'Shift KPIs')}</h2>
      </header>
      <div class="ui-offer-bulk-kpi-grid">
        <KpiCard
          title={t(i18n, 'bulkKpiDayTitle', 'Selected day')}
          value={formatKpiValue(locale, committed.kpis.day)}
          detail={`${committed.kpis.day.deliveries} • ${dayDistance}`}
        />
        <KpiCard
          title={t(i18n, 'bulkKpiWeekTitle', 'Rolling 7 days')}
          value={formatKpiValue(locale, committed.kpis.rolling7d)}
          detail={`${committed.kpis.rolling7d.deliveries} • ${weekDistance}`}
        />
      </div>
    </section>
  );
});
