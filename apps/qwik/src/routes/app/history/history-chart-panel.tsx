import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { OfferStatsDay } from '../../../lib/types/offer';
import {
  formatChartCurrency,
  formatCurrency,
} from './history-helpers';
import {
  buildProfitChartGeometry,
  buildProfitSeriesValues,
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

  const sortedStats = [...stats].sort((a, b) => a.dayStart.getTime() - b.dayStart.getTime());
  const chartValues = buildProfitSeriesValues(sortedStats);
  const hasChartData = chartValues.length > 0;
  const chart = buildProfitChartGeometry(chartValues);

  const latestValue = chartValues.length > 0 ? chartValues[chartValues.length - 1] : 0;

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
            {chart.singlePoint ? (
              <circle
                class={{ 'ui-history-yearly-point': true, 'is-intro': showIntro }}
                cx={String(chart.singlePoint.x)}
                cy={String(chart.singlePoint.y)}
                r="6"
              />
            ) : null}
          </svg>
        </div>
      )}
    </div>
  );
});
