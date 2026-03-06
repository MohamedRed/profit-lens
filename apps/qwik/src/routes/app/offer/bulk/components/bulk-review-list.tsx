import { component$ } from '@builder.io/qwik';
import type { BulkParsedRow } from '../../../../../lib/types/bulk-offers';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../../lib/types/vehicle';
import { BulkReviewRowCard } from './bulk-review-row-card';

interface BulkReviewListProps {
  rows: BulkParsedRow[];
  locale: string;
  profile: UserProfile | null;
  vehicle: VehicleProfile | null;
}

export const BulkReviewList = component$<BulkReviewListProps>((props) => {
  const i18n = useI18n();
  if (props.rows.length === 0) {
    return null;
  }
  return (
    <section class="ui-offer-bulk-section">
      <header class="ui-offer-bulk-section-head">
        <h2>{t(i18n, 'bulkReviewTitle', 'Review deliveries')}</h2>
        <p>
          {t(
            i18n,
            'bulkReviewSubtitle',
            'Each row is processed automatically with your default vehicle and minimum profit target, like single-offer analysis.',
          )}
        </p>
      </header>
      <div class="ui-offer-bulk-row-list">
        {props.rows.map((row, index) => (
          <BulkReviewRowCard
            key={`${row.sourceIndex}-${index}`}
            row={row}
            index={index}
            locale={props.locale}
            profile={props.profile}
            vehicle={props.vehicle}
          />
        ))}
      </div>
    </section>
  );
});
