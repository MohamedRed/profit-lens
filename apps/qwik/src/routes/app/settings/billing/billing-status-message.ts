import { formatTemplate, t, type I18nStore } from '../../../../lib/i18n/i18n-context';

export const buildDuplicateCleanupNotice = (i18n: I18nStore, count: number): string => {
  return formatTemplate(
    t(
      i18n,
      'billingDuplicateCleanupNotice',
      'We found {count} extra subscriptions and scheduled them to cancel at period end.',
    ),
    {
      count: String(count),
    },
  );
};

export const appendDuplicateCleanupNotice = (
  i18n: I18nStore,
  baseMessage: string,
  count: number,
): string => {
  if (count <= 0) {
    return baseMessage;
  }
  return `${baseMessage} ${buildDuplicateCleanupNotice(i18n, count)}`;
};
