import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { OfferStatsDay } from '../../../lib/types/offer';
import {
  averageProfit,
  buildSummaryHeadline,
  formatChartCurrency,
  formatCurrency,
  profitDeltaTodayVsEarlier,
} from './history-helpers';
import { buildProfitChartGeometry, buildProfitSeriesValues } from './history-profit-chart';

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

  const sortedStats = [...stats].sort((a, b) => a.dayStart.getTime() - b.dayStart.getTime());
  const chartValues = buildProfitSeriesValues(sortedStats);
  const hasChartData = chartValues.length > 0;
  const chart = buildProfitChartGeometry(chartValues);

  const latestValue = chartValues.length > 0 ? chartValues[chartValues.length - 1] : 0;
  const summaryHeadline = buildSummaryHeadline(i18n, sortedStats, locale);
  const averageValue = averageProfit(sortedStats);
  const trendDelta = profitDeltaTodayVsEarlier(sortedStats);
  const isTrendPositive = trendDelta !== null && trendDelta > 0.01;
  const isTrendNegative = trendDelta !== null && trendDelta < -0.01;
  const trendIcon = isTrendPositive ? 'trending_up' : isTrendNegative ? 'trending_down' : 'trending_flat';

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

  const showIntro = introActive.value && !isPreload;

  return (
    <div class="ui-history-chart-card">
      <div class="ui-history-chart-head">
        <div class="ui-history-chart-heading">
          <h2 class="ui-history-chart-title">{t(i18n, 'historyChartTitle', 'Profit over time')}</h2>
          <p class="ui-history-chart-subtitle">
            {t(i18n, 'latestProfitLabel', 'Latest profit')}: {formatCurrency(locale, latestValue)}
          </p>
        </div>
      </div>

      <div class="ui-history-kpi-grid">
        <div class="ui-history-kpi-card">
          <p class="ui-history-kpi-label">
            <span class="ui-history-dot is-profit" />
            {t(i18n, 'historySummaryAverageProfit', 'Average profit: {amount}').replace(
              '{amount}',
              formatCurrency(locale, averageValue),
            )}
          </p>
        </div>
      </div>

      {!hasChartData ? (
        <p class="ui-history-empty">
          {t(i18n, 'historyChartEmptyMessage', 'Add at least 2 offers to see the chart.')}
        </p>
      ) : (
        <div class={{ 'ui-history-chart-shell': true, 'is-intro': showIntro }}>
          <div class="ui-history-chart-axis">
            {chart.tickValues.map((value, index) => (
              <span key={`axis-${index}`}>{formatChartCurrency(locale, value)}</span>
            ))}
          </div>
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
              d={chart.linePath}
              fill="none"
              stroke-width="4"
              pathLength={100}
            />
          </svg>
        </div>
      )}

      <div class="ui-history-insight-cards">
        <article
          class={{
            'ui-history-insight-card': true,
            'is-positive': isTrendPositive,
            'is-negative': isTrendNegative,
            'is-neutral': !isTrendPositive && !isTrendNegative,
          }}
        >
          <div class="ui-history-insight-row">
            <span
              class={{
                'ui-history-insight-icon': true,
                'is-positive': isTrendPositive,
                'is-negative': isTrendNegative,
                'is-neutral': !isTrendPositive && !isTrendNegative,
              }}
              aria-hidden="true"
            >
              <span class="material-icons-outlined">{trendIcon}</span>
            </span>
            <p class="ui-history-summary-headline">{summaryHeadline}</p>
          </div>
        </article>
        <article class="ui-history-insight-card is-info">
          <div class="ui-history-insight-row">
            <span class="ui-history-insight-icon is-info" aria-hidden="true">
              <span class="material-icons-outlined">info</span>
            </span>
            <p class="ui-history-chart-hint">
              {t(
                i18n,
                'historyChartHintMessage',
                'Use this chart to compare profits above/below the break-even line.',
              )}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
});
