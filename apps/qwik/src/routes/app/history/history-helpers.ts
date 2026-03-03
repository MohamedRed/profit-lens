import { t, type I18nStore } from '../../../lib/i18n/i18n-context';
import {
  formatCurrencyAmount,
  formatDecimalNumber,
  formatWholeNumber,
  resolveFormattingLocale,
} from '../../../lib/i18n/number-format';
import type { OfferStatsDay } from '../../../lib/types/offer';

export const chartWidth = 288;
export const chartHeight = 170;
export const chartPadding = 12;

export const formatCurrency = (locale: string, value: number): string => {
  return formatCurrencyAmount(locale, value);
};

export const formatChartCurrency = (locale: string, value: number): string => {
  return formatCurrency(locale, value);
};

export const formatDistanceKm = (locale: string, value: number, unitLabel: string): string => {
  return `${formatDecimalNumber(locale, value, 1)} ${unitLabel}`;
};

export const formatDurationMinutes = (locale: string, value: number, unitLabel: string): string => {
  return `${formatWholeNumber(locale, value)} ${unitLabel}`;
};

export const formatShortDateTime = (locale: string, value: Date | null): string => {
  if (!value) {
    return 'n/a';
  }
  const formatLocale = resolveFormattingLocale(locale);
  const date = new Intl.DateTimeFormat(formatLocale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value);
  const time = new Intl.DateTimeFormat(formatLocale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);
  return `${date} • ${time}`;
};

const isBeforeLocalDay = (value: Date, localDayStart: Date): boolean => {
  const localDate = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  return localDate.getTime() < localDayStart.getTime();
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

export const profitDeltaTodayVsEarlier = (stats: OfferStatsDay[]): number | null => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayStats = stats.filter((entry) => !isBeforeLocalDay(entry.dayStart, startOfToday));
  const earlierStats = stats.filter((entry) => isBeforeLocalDay(entry.dayStart, startOfToday));

  if (todayStats.length === 0 || earlierStats.length === 0) {
    return null;
  }
  return averageProfit(todayStats) - averageProfit(earlierStats);
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
