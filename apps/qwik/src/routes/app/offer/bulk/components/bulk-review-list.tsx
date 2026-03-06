import { component$, type PropFunction } from '@builder.io/qwik';
import type { BulkParsedRow } from '../../../../../lib/types/bulk-offers';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import { BulkReviewRowCard } from './bulk-review-row-card';

interface BulkReviewListProps {
  rows: BulkParsedRow[];
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
            'Only validated rows are saved. Edit values before committing.',
          )}
        </p>
      </header>
      <div class="ui-offer-bulk-row-list">
        {props.rows.map((row, index) => (
          <BulkReviewRowCard
            key={`${row.sourceIndex}-${index}`}
            row={row}
            index={index}
            onPatch$={props.onPatch$}
            onRemove$={props.onRemove$}
          />
        ))}
      </div>
    </section>
  );
});
