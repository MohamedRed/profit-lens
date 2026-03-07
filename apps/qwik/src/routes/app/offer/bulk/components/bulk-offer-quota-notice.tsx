import { component$ } from '@builder.io/qwik';
import { formatTemplate, t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkOfferQuotaNoticeProps {
  remainingOffers: number | null;
}

export const BulkOfferQuotaNotice = component$<BulkOfferQuotaNoticeProps>(({ remainingOffers }) => {
  const i18n = useI18n();
  const value =
    remainingOffers == null
      ? t(i18n, 'offersRemainingUnlimited', 'Unlimited offers')
      : formatTemplate(t(i18n, 'offersRemainingValue', '{remaining} offers remaining this month'), {
          remaining: String(remainingOffers),
          count: String(remainingOffers),
        });

  return (
    <section class="ui-offer-usage-inline-shell" aria-live="polite">
      <div class="ui-offer-usage-inline">
        <div class="ui-offer-usage-inline-copy">
          <p class="ui-offer-usage-inline-title">{t(i18n, 'offersRemainingTitle', 'Offers remaining')}</p>
          <p class="ui-offer-usage-inline-value">{value}</p>
        </div>
      </div>
    </section>
  );
});
