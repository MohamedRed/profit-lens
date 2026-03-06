import { $, component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { OfferAnalysisRecord } from '../../../../../lib/features/offers/offer-analysis-record';
import { OfferOverviewSections } from '../../components/offer-overview-sections';

interface BulkSavedResultsProps {
  minProfitabilityEuro: number;
  records: OfferAnalysisRecord[];
}

export const BulkSavedResults = component$<BulkSavedResultsProps>(({ minProfitabilityEuro, records }) => {
  const i18n = useI18n();
  const onViewDetails$ = $(() => undefined);

  if (records.length === 0) {
    return null;
  }

  return (
    <section class="ui-offer-bulk-section">
      <header class="ui-offer-bulk-section-head">
        <h2>{t(i18n, 'bulkSavedResultsTitle', 'Saved deliveries')}</h2>
        <p>{t(i18n, 'bulkSavedResultsSubtitle', 'Each delivery was analyzed and saved automatically.')}</p>
      </header>

      <div class="ui-offer-bulk-result-list">
        {records.map((record, index) => {
          const routeLabel = [record.offer.pickupName, record.offer.dropoffName].filter(Boolean).join(' -> ');
          const detailsHref = `/next/app/history/details?offerId=${encodeURIComponent(record.id)}&backTo=${encodeURIComponent('/next/app/offer/bulk')}`;

          return (
            <article class="ui-offer-bulk-result-card" key={record.id}>
              {routeLabel ? (
                <header class="ui-offer-bulk-result-head">
                  <h3>
                    {t(i18n, 'bulkDeliveryLabel', 'Delivery')} #{index + 1}
                  </h3>
                  <p>{routeLabel}</p>
                </header>
              ) : null}

              <OfferOverviewSections
                detailsHref={detailsHref}
                minProfitabilityEuro={minProfitabilityEuro}
                onViewDetails$={onViewDetails$}
                record={record}
              />
            </article>
          );
        })}
      </div>
    </section>
  );
});
