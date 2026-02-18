import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { OfferStatsDay } from '../../../lib/types/offer';
import {
  averageProfit,
  buildSummaryHeadline,
  chartHeight,
  chartPadding,
  chartWidth,
  formatChartCurrency,
  formatCurrency,
} from './history-helpers';

interface HistoryChartPanelProps {
  stats: OfferStatsDay[];
  locale: string;
}

export const HistoryChartPanel = component$<HistoryChartPanelProps>(({ stats, locale }) => {
  const i18n = useI18n();

  const sortedStats = [...stats].sort((a, b) => a.dayStart.getTime() - b.dayStart.getTime());
  const chartValues = sortedStats
    .map((entry) => (entry.offerCount > 0 ? entry.netProfitEuro / entry.offerCount : 0))
    .filter((value) => Number.isFinite(value));

  const maxAbsValue =
    chartValues.length > 0
      ? chartValues.reduce((acc, value) => Math.max(acc, Math.abs(value)), 0)
      : 0;
  const normalizedMax = maxAbsValue > 0 ? maxAbsValue : 1;
  const normalizedMin = -normalizedMax;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;
  const toY = (value: number): number => {
    const ratio = (value - normalizedMin) / (normalizedMax - normalizedMin || 1);
    return chartHeight - chartPadding - ratio * usableHeight;
  };
  const thresholdY = toY(0);
  const chartPoints = chartValues.map((value, index) => {
    const x =
      chartPadding +
      (chartValues.length <= 1 ? usableWidth / 2 : (index / (chartValues.length - 1)) * usableWidth);
    return {
      x,
      y: toY(value),
      value,
    };
  });
  const pathData = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const tickValues = [normalizedMax, normalizedMax / 2, 0, normalizedMin / 2, normalizedMin];
  const latestValue = chartValues.length > 0 ? chartValues[chartValues.length - 1] : 0;
  const summaryHeadline = buildSummaryHeadline(i18n, sortedStats, locale);
  const averageAll = averageProfit(sortedStats);
  const averageTemplate = t(i18n, 'historySummaryAverageProfit', 'Average profit: {amount}');
  const averageText = averageTemplate.replace('{amount}', formatCurrency(locale, averageAll));

  return (
    <div class="ui-history-chart-block">
      <h2 class="ui-history-chart-title">{t(i18n, 'historyChartTitle', 'Profit trend')}</h2>
      <p class="ui-history-chart-subtitle">
        {t(i18n, 'latestProfitLabel', 'Latest profit')}: {formatCurrency(locale, latestValue)}
      </p>

      {chartValues.length === 0 ? (
        <p class="ui-history-empty">
          {t(i18n, 'historyChartEmptyMessage', 'Add at least 2 offers to see the chart.')}
        </p>
      ) : (
        <div class="ui-history-chart-shell">
          <div class="ui-history-chart-axis">
            {tickValues.map((value, index) => (
              <span key={`${value}-${index}`}>{formatChartCurrency(locale, value)}</span>
            ))}
          </div>
          <div class="ui-history-chart-canvas">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} aria-label="history chart">
              <rect
                x="0.5"
                y="0.5"
                width={chartWidth - 1}
                height={chartHeight - 1}
                rx="12"
                ry="12"
                fill="transparent"
                stroke="rgba(24, 24, 27, 0.7)"
                stroke-width="1"
              />
              {tickValues.map((value, index) => (
                <line
                  key={`${value}-${index}`}
                  x1="0"
                  x2={String(chartWidth)}
                  y1={String(toY(value))}
                  y2={String(toY(value))}
                  stroke="rgba(24, 24, 27, 0.45)"
                  stroke-width="1"
                />
              ))}
              <line
                x1="0"
                x2={String(chartWidth)}
                y1={String(thresholdY)}
                y2={String(thresholdY)}
                stroke="#ef4444"
                stroke-width="2"
              />
              <path d={pathData} fill="none" stroke="#7c5cf5" stroke-width="3" />
              {chartPoints.map((point, index) => (
                <circle key={index} cx={String(point.x)} cy={String(point.y)} r="4" fill="#7c5cf5" />
              ))}
            </svg>
          </div>
        </div>
      )}

      <div class="ui-history-legend">
        <span class="ui-history-legend-item">
          <span class="ui-history-dot is-profit" />
          {t(i18n, 'historyChartProfitLabel', 'Profit')}
        </span>
        <span class="ui-history-legend-item">
          <span class="ui-history-dot is-threshold" />
          {t(i18n, 'profitThresholdLabel', 'Break-even')}
        </span>
      </div>

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
  );
});
