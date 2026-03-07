import { formatTemplate, t, type I18nStore } from '../../../../lib/i18n/i18n-context';

export const resolveTimeZone = (): string | null => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone && zone.trim().length > 0 ? zone : null;
  } catch {
    return null;
  }
};

export const buildBulkQuotaExceededMessage = (
  i18n: I18nStore,
  requestedCount: number,
  remainingCount: number,
): string =>
  formatTemplate(
    t(
      i18n,
      'bulkOfferImportExceedsRemainingMessage',
      'This import needs {count} offers, but only {remaining} remain this month.',
    ),
    {
      count: String(requestedCount),
      remaining: String(remainingCount),
    },
  );
