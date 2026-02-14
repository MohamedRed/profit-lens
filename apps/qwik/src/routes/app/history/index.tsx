import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Tabs } from '@qwik-ui/headless';
import { useAuth } from '../../../lib/auth/auth-context';
import { watchOffers, watchOfferStats } from '../../../lib/features/offers/offers-service';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import type { OfferRecord, OfferStatsDay } from '../../../lib/types/offer';
import {
  averageProfit,
  buildSummaryHeadline,
  chartHeight,
  chartPadding,
  chartWidth,
  formatChartCurrency,
  formatCurrency,
  formatShortDateTime,
} from './history-helpers';
import { saveHistoryOfferCache } from './history-offer-cache';
import { readHistoryScrollY, readHistoryViewMode, saveHistoryScrollY, saveHistoryViewMode } from './history-navigation-state';

export default component$(() => {
  const i18n = useI18n();
  const auth = useAuth();
  const offers = useSignal<OfferRecord[]>([]);
  const stats = useSignal<OfferStatsDay[]>([]);
  const selectedTabIndex = useSignal<number>(0);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    if (!user) {
      offers.value = [];
      stats.value = [];
      return;
    }

    const unsubscribeOffers = watchOffers(user.uid, (items) => {
      offers.value = items;
    });
    const unsubscribeStats = watchOfferStats(user.uid, (items) => {
      stats.value = items;
    });

    cleanup(() => {
      unsubscribeOffers();
      unsubscribeStats();
    });
  });

  useVisibleTask$(({ cleanup }) => {
    const savedMode = readHistoryViewMode();
    if (savedMode) {
      selectedTabIndex.value = savedMode === 'charts' ? 1 : 0;
    }

    const savedScrollY = readHistoryScrollY();
    if (savedScrollY !== null) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedScrollY, behavior: 'auto' });
      });
    }

    const onScroll = () => {
      saveHistoryScrollY(window.scrollY);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    cleanup(() => {
      window.removeEventListener('scroll', onScroll);
    });
  });

  useVisibleTask$(({ track }) => {
    const currentOffers = track(() => offers.value);
    saveHistoryOfferCache(currentOffers);
  });

  const locale = i18n.locale.value;
  const onHistoryModeChange$ = $((nextIndex: number) => {
    saveHistoryViewMode(nextIndex === 1 ? 'charts' : 'list');
  });
  const sortedStats = [...stats.value].sort((a, b) => a.dayStart.getTime() - b.dayStart.getTime());
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

  const tickValues = [
    normalizedMax,
    normalizedMax / 2,
    0,
    normalizedMin / 2,
    normalizedMin,
  ];
  const latestValue = chartValues.length > 0 ? chartValues[chartValues.length - 1] : 0;
  const summaryHeadline = buildSummaryHeadline(i18n, sortedStats, locale);
  const averageAll = averageProfit(sortedStats);
  const averageTemplate = t(i18n, 'historySummaryAverageProfit', 'Average profit: {amount}');
  const averageText = averageTemplate.replace('{amount}', formatCurrency(locale, averageAll));

  return (
    <div class="ui-history-root">
      <Tabs.Root bind:selectedIndex={selectedTabIndex} onSelectedIndexChange$={onHistoryModeChange$}>
        <Tabs.List class="ui-history-segmented">
          <Tabs.Tab class="ui-history-segment-btn" selectedClassName="is-active">
            <span class="material-icons-outlined ui-history-segment-icon" aria-hidden="true">
              list
            </span>
            <span>{t(i18n, 'historyViewListLabel', 'List')}</span>
          </Tabs.Tab>
          <Tabs.Tab class="ui-history-segment-btn" selectedClassName="is-active">
            <span class="material-icons-outlined ui-history-segment-icon" aria-hidden="true">
              show_chart
            </span>
            <span>{t(i18n, 'historyViewChartsLabel', 'Charts')}</span>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel>
          <ul class="ui-history-list">
            {offers.value.length === 0 ? (
              <li class="ui-history-empty">{t(i18n, 'noHistoryMessage', 'No offers saved yet.')}</li>
            ) : null}
            {offers.value.map((item) => {
              const profit = item.netProfitEuro ?? 0;
              const distance = item.routeVerifiedDistanceKm ?? item.distanceKm;
              return (
                <li key={item.id} class="ui-history-item">
                  <Link
                    class="ui-history-item-link"
                    href={`/next/app/history/details/?offerId=${encodeURIComponent(item.id)}`}
                  >
                    <div class="ui-history-item-main">
                      <p class="ui-history-item-profit">{formatCurrency(locale, profit)}</p>
                      <p class="ui-history-item-meta">
                        {distance.toFixed(1)} km • {formatShortDateTime(locale, item.createdAt)}
                      </p>
                    </div>
                    <div class="ui-history-item-side">
                      <p class="ui-history-item-payout">{formatCurrency(locale, item.payoutEuro)}</p>
                      <span class="material-icons-outlined ui-history-item-chevron" aria-hidden="true">
                        chevron_right
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Tabs.Panel>

        <Tabs.Panel>
          <div class="ui-history-chart-block">
            <h2 class="ui-history-chart-title">{t(i18n, 'historyChartTitle', 'Profit trend')}</h2>
            <p class="ui-history-chart-subtitle">
              {t(i18n, 'latestProfitLabel', 'Latest profit')}: {formatCurrency(locale, latestValue)}
            </p>

            {chartValues.length < 2 ? (
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
                {t(i18n, 'profitThresholdLabel', 'Profitability threshold')}
              </span>
            </div>

            <p class="ui-history-summary-headline">{summaryHeadline}</p>
            <p class="ui-history-summary-subtitle">{averageText}</p>
            <p class="ui-history-chart-hint">
              {t(
                i18n,
                'historyChartHintMessage',
                'Use this chart to compare profits above or below the profitability threshold.',
              )}
            </p>
          </div>
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
});
