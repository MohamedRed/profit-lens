import { component$, type PropFunction } from '@builder.io/qwik';
import type { BulkParsedRow } from '../../../../../lib/types/bulk-offers';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../../lib/types/vehicle';
import { BulkReviewRowCard } from './bulk-review-row-card';

interface BulkReviewListProps {
  rows: BulkParsedRow[];
  profile: UserProfile | null;
  vehicle: VehicleProfile | null;
  onPatch$: PropFunction<(index: number, patch: Partial<BulkParsedRow>) => void>;
  onRemove$: PropFunction<(index: number) => void>;
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
            'Each row uses your default vehicle and minimum profit target, like single-offer analysis. Edit values before committing.',
          )}
        </p>
      </header>
      <div class="ui-offer-bulk-row-list">
        {props.rows.map((row, index) => (
          <BulkReviewRowCard
            key={`${row.sourceIndex}-${index}`}
            row={row}
            index={index}
            profile={props.profile}
            vehicle={props.vehicle}
            onPatch$={props.onPatch$}
            onRemove$={props.onRemove$}
          />
        ))}
      </div>
    </section>
  );
});
