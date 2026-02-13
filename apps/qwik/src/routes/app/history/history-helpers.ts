import { t, type I18nStore } from '../../../lib/i18n/i18n-context';
import type { OfferStatsDay } from '../../../lib/types/offer';

export const chartWidth = 288;
export const chartHeight = 170;
export const chartPadding = 12;

export const formatCurrency = (locale: string, value: number): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatChartCurrency = (locale: string, value: number): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatShortDateTime = (locale: string, value: Date | null): string => {
  if (!value) {
    return 'n/a';
  }
  const date = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
  return `${date} • ${time}`;
};

const isBeforeLocalDay = (value: Date, localDayStart: Date): boolean => {
  const local = value.toLocaleDateString('en-CA');
  const localDate = new Date(local);
  return localDate < localDayStart;
};

export const averageProfit = (entries: OfferStatsDay[]): number => {
  let totalNet = 0;
  let totalCount = 0;
  for (const entry of entries) {
    totalNet += entry.netProfitEuro;
    totalCount += entry.offerCount;
  }
  if (totalCount <= 0) {
    return 0;
  }
  return totalNet / totalCount;
};

export const buildSummaryHeadline = (
  i18n: I18nStore,
  stats: OfferStatsDay[],
  locale: string,
): string => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStats = stats.filter((entry) => !isBeforeLocalDay(entry.dayStart, startOfToday));
  const earlierStats = stats.filter((entry) => isBeforeLocalDay(entry.dayStart, startOfToday));

  if (todayStats.length === 0) {
    return t(i18n, 'historySummaryNoToday', 'No offers today yet.');
  }
  if (earlierStats.length === 0) {
    return t(i18n, 'historySummaryNotEnoughHistory', 'Not enough history to compare.');
  }

  const delta = averageProfit(todayStats) - averageProfit(earlierStats);
  if (Math.abs(delta) < 0.01) {
    return t(i18n, 'historySummaryTodayEqual', 'Today is about as profitable as earlier days.');
  }

  const amount = formatCurrency(locale, Math.abs(delta));
  const template =
    delta > 0
      ? t(i18n, 'historySummaryTodayMore', 'Today is more profitable by {amount}.')
      : t(i18n, 'historySummaryTodayLess', 'Today is less profitable by {amount}.');
  return template.replace('{amount}', amount);
};
