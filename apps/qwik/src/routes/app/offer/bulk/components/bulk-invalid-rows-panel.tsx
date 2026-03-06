import { component$ } from '@builder.io/qwik';
import type { BulkInvalidRow } from '../../../../../lib/types/bulk-offers';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkInvalidRowsPanelProps {
  rows: BulkInvalidRow[];
}

export const BulkInvalidRowsPanel = component$<BulkInvalidRowsPanelProps>(({ rows }) => {
  const i18n = useI18n();
  if (rows.length === 0) {
    return null;
  }
  return (
    <section class="ui-offer-bulk-section ui-offer-bulk-invalid">
      <header class="ui-offer-bulk-section-head">
        <h2>{t(i18n, 'bulkInvalidRowsTitle', 'Skipped rows')}</h2>
        <p>
          {t(
            i18n,
            'bulkInvalidRowsSubtitle',
            'Rows with missing required fields are skipped and not saved.',
          )}
        </p>
      </header>
      <ul class="ui-offer-bulk-invalid-list">
        {rows.map((row) => (
          <li key={`invalid-${row.sourceIndex}`}>
            <p>
              {t(i18n, 'bulkDeliveryLabel', 'Delivery')} #{row.sourceIndex + 1}
            </p>
            <p>{row.issues.map((issue) => issue.message).join(' ')}</p>
          </li>
        ))}
      </ul>
    </section>
  );
});
