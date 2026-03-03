import type { LocaleCode } from './i18n-context';

const defaultLocale: LocaleCode = 'fr';

const localeTagByCode: Record<LocaleCode, string> = {
  fr: 'fr-FR',
  en: 'en-US',
  ar: 'ar-MA',
};

export const resolveFormattingLocale = (locale: string | null | undefined): string => {
  const normalized = String(locale ?? '').trim().toLowerCase();
  if (normalized.startsWith('ar')) {
    return localeTagByCode.ar;
  }
  if (normalized.startsWith('en')) {
    return localeTagByCode.en;
  }
  if (normalized.startsWith('fr')) {
    return localeTagByCode.fr;
  }
  return localeTagByCode[defaultLocale];
};

export const formatCurrencyAmount = (
  locale: string | null | undefined,
  value: number,
  currency: string = 'EUR',
): string => {
  return new Intl.NumberFormat(resolveFormattingLocale(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDecimalNumber = (
  locale: string | null | undefined,
  value: number,
  fractionDigits: number,
): string => {
  return new Intl.NumberFormat(resolveFormattingLocale(locale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

export const formatWholeNumber = (locale: string | null | undefined, value: number): string => {
  return new Intl.NumberFormat(resolveFormattingLocale(locale), {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
};

export const formatCurrencyPerUnit = (
  locale: string | null | undefined,
  value: number,
  unitLabel: string,
): string => {
  return `${formatCurrencyAmount(locale, value)}/${unitLabel}`;
};

export const formatDistanceKm = (
  locale: string | null | undefined,
  value: number,
  unitLabel: string,
): string => {
  return `${formatDecimalNumber(locale, value, 1)} ${unitLabel}`;
};

export const formatDurationMinutes = (
  locale: string | null | undefined,
  value: number,
  unitLabel: string,
): string => {
  return `${formatWholeNumber(locale, value)} ${unitLabel}`;
};

export const resolveCurrencySymbol = (
  locale: string | null | undefined,
  currency: string = 'EUR',
): string => {
  const currencyPart = new Intl.NumberFormat(resolveFormattingLocale(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .formatToParts(0)
    .find((part) => part.type === 'currency');

  return currencyPart?.value ?? currency;
};
