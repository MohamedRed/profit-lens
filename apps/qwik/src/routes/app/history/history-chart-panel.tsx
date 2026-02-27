import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { OfferStatsDay } from '../../../lib/types/offer';
import { averageProfit, buildSummaryHeadline, formatCurrency } from './history-helpers';
import {
  buildProfitChartGeometry,
  buildProfitYearSeries,
  extractProfitYears,
  formatAxisValue,
} from './history-profit-chart';

interface HistoryChartPanelProps {
  stats: OfferStatsDay[];
  locale: string;
  isActive?: boolean;
  preload?: boolean;
}

const introAnimationDurationMs = 760;

export const HistoryChartPanel = component$<HistoryChartPanelProps>(({ stats, locale, isActive, preload }) => {
  const i18n = useI18n();
  const introActive = useSignal(false);
  const introCompleted = useSignal(false);
  const selectedYear = useSignal(new Date().getUTCFullYear());

  const availableYears = extractProfitYears(stats);
  const sortedStats = [...stats].sort((a, b) => a.dayStart.getTime() - b.dayStart.getTime());
  const activeYear = availableYears.includes(selectedYear.value)
    ? selectedYear.value
    : availableYears[0];
  const yearlySeries = buildProfitYearSeries(stats, activeYear, locale);
  const hasChartData = yearlySeries.months.some((month) => Math.abs(month.averageProfitEuro) > 0.001);
  const chart = buildProfitChartGeometry(yearlySeries.months);
  const latestStatsEntry = sortedStats.length > 0 ? sortedStats[sortedStats.length - 1] : null;
  const latestProfit =
    latestStatsEntry && latestStatsEntry.offerCount > 0
      ? latestStatsEntry.netProfitEuro / latestStatsEntry.offerCount
      : 0;
  const summaryHeadline = buildSummaryHeadline(i18n, sortedStats, locale);
  const averageTemplate = t(i18n, 'historySummaryAverageProfit', 'Average profit: {amount}');
  const averageText = averageTemplate.replace('{amount}', formatCurrency(locale, averageProfit(sortedStats)));

  const growth = yearlySeries.growthPercent;
  const growthValue =
    growth === null
      ? null
      : new Intl.NumberFormat(locale, {
          maximumFractionDigits: 0,
        }).format(Math.abs(growth));
  const growthPrefix = growth === null ? '' : growth >= 0 ? '+' : '-';
  const growthText =
    growthValue === null
      ? t(i18n, 'historyChartGrowthUnavailable', 'No previous-year data yet.')
      : t(i18n, 'historyChartGrowthTemplate', '({change}%) than last year').replace(
          '{change}',
          `${growthPrefix}${growthValue}`,
        );

  const isPanelActive = isActive ?? true;
  const isPreload = preload ?? false;

  useTask$(({ track, cleanup }) => {
    const active = track(() => isPanelActive);
    const hasData = track(() => hasChartData);
    if (typeof window === 'undefined' || !active || isPreload || !hasData || introCompleted.value) {
      return;
    }
    introCompleted.value = true;
    introActive.value = true;
    const timer = window.setTimeout(() => {
      introActive.value = false;
    }, introAnimationDurationMs);
    cleanup(() => {
      window.clearTimeout(timer);
    });
  });

  useTask$(({ track }) => {
    track(() => stats.map((entry) => entry.dayStart.getTime()).join(','));
    if (!availableYears.includes(selectedYear.value)) {
      selectedYear.value = availableYears[0];
    }
  });

  const showIntro = introActive.value && !isPreload;

  return (
    <div class="ui-history-chart-card">
      <div class="ui-history-chart-head">
        <div class="ui-history-chart-heading">
          <h2 class="ui-history-chart-title">{t(i18n, 'historyChartTitle', 'Profit over time')}</h2>
          <p class="ui-history-chart-subtitle">{growthText}</p>
        </div>

        <label class="ui-history-year-select-wrap">
          <span class="sr-only">{t(i18n, 'historyChartYearLabel', 'Year')}</span>
          <select
            class="ui-history-year-select"
            value={String(activeYear)}
            onChange$={(event) => {
              const nextYear = Number((event.target as HTMLSelectElement).value);
              if (!Number.isNaN(nextYear)) {
                selectedYear.value = nextYear;
              }
            }}
          >
            {availableYears.map((year) => (
              <option key={year} value={String(year)}>
                {String(year)}
              </option>
            ))}
          </select>
          <span class="material-icons-outlined ui-history-year-select-icon" aria-hidden="true">
            expand_more
          </span>
        </label>
      </div>

      <div class="ui-history-kpi-grid">
        <div class="ui-history-kpi-card">
          <p class="ui-history-kpi-label">
            <span class="ui-history-dot is-profit" />
            {t(i18n, 'historyChartProfitLabel', 'Profit')}
          </p>
          <p class="ui-history-kpi-value">{formatCurrency(locale, yearlySeries.averageProfitEuro)}</p>
        </div>
        <div class="ui-history-kpi-card">
          <p class="ui-history-kpi-label">
            <span class="ui-history-dot is-threshold" />
            {t(i18n, 'profitThresholdLabel', 'Break-even')}
          </p>
          <p class="ui-history-kpi-value">{formatCurrency(locale, 0)}</p>
        </div>
      </div>

      <div class="ui-history-insight-strip">
        <p class="ui-history-insight-pill">
          <span class="ui-history-insight-label">{t(i18n, 'latestProfitLabel', 'Latest profit')}</span>
          <span class="ui-history-insight-value">{formatCurrency(locale, latestProfit)}</span>
        </p>
      </div>

      {!hasChartData ? (
        <p class="ui-history-empty">
          {t(i18n, 'historyChartEmptyMessage', 'Add at least 2 offers to see the chart.')}
        </p>
      ) : (
        <div class={{ 'ui-history-yearly-chart-wrap': true, 'is-intro': showIntro }}>
          <svg class="ui-history-yearly-chart" viewBox={`0 0 ${chart.width} ${chart.height}`} aria-label="history chart">
            <defs>
              <linearGradient id="ui-history-profit-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="rgba(124, 92, 245, 0.18)" />
                <stop offset="100%" stop-color="rgba(124, 92, 245, 0)" />
              </linearGradient>
            </defs>

            {chart.gridLinesY.map((y, index) => (
              <line
                key={`grid-${index}`}
                x1={String(chart.plotLeft)}
                x2={String(chart.plotRight)}
                y1={String(y)}
                y2={String(y)}
                class="ui-history-yearly-grid"
              />
            ))}

            {chart.yTicks.map((tick, index) => (
              <text
                key={`tick-${index}`}
                x={String(chart.plotLeft - 8)}
                y={String(chart.gridLinesY[index] + 5)}
                text-anchor="end"
                class="ui-history-yearly-axis-label"
              >
                {formatAxisValue(locale, tick)}
              </text>
            ))}

            <path
              class={{ 'ui-history-yearly-area': true, 'is-intro': showIntro }}
              d={chart.areaPath}
              fill="url(#ui-history-profit-gradient)"
            />
            <line
              class={{ 'ui-history-yearly-threshold': true, 'is-intro': showIntro }}
              x1={String(chart.plotLeft)}
              x2={String(chart.plotRight)}
              y1={String(chart.thresholdY)}
              y2={String(chart.thresholdY)}
            />
            <path
              class={{ 'ui-history-yearly-line': true, 'is-intro': showIntro }}
              d={chart.profitLinePath}
              fill="none"
              stroke-width="4"
              pathLength={100}
            />

            {yearlySeries.months.map((month, index) => (
              <text
                key={`month-${month.monthIndex}`}
                x={String(chart.monthLineX[index])}
                y={String(chart.height - 14)}
                text-anchor="middle"
                class="ui-history-yearly-month-label"
              >
                {month.label}
              </text>
            ))}
          </svg>
        </div>
      )}

      <div class="ui-history-chart-meta">
        <p class="ui-history-summary-headline">{summaryHeadline}</p>
        <p class="ui-history-summary-subtitle">{averageText}</p>
        <p class="ui-history-chart-hint">
          {t(
            i18n,
            'historyChartHintMessage',
            'Use this chart to compare profits above/below the break-even line.',
          )}
        </p>
      </div>
    </div>
  );
});
