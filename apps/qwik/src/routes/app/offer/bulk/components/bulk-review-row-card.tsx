import { component$, type PropFunction } from '@builder.io/qwik';
import type { BulkParsedRow } from '../../../../../lib/types/bulk-offers';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';

interface BulkReviewRowCardProps {
  row: BulkParsedRow;
  index: number;
  onPatch$: PropFunction<(index: number, patch: Partial<BulkParsedRow>) => void>;
  onRemove$: PropFunction<(index: number) => void>;
}

export const BulkReviewRowCard = component$<BulkReviewRowCardProps>((props) => {
  const i18n = useI18n();
  return (
    <article class="ui-offer-bulk-row-card">
      <header class="ui-offer-bulk-row-head">
        <h3>
          {t(i18n, 'bulkDeliveryLabel', 'Delivery')} #{props.index + 1}
        </h3>
        <button type="button" class="ui-button ui-button-ghost" onClick$={() => props.onRemove$(props.index)}>
          {t(i18n, 'bulkRemoveRowButton', 'Remove')}
        </button>
      </header>

      <div class="ui-offer-bulk-grid">
        <label class="ui-field">
          <span>{t(i18n, 'offerAmountLabel', 'Payout (EUR)')}</span>
          <input
            class="ui-input"
            type="number"
            step="0.01"
            value={String(props.row.payoutEuro)}
            onInput$={(_, input) => props.onPatch$(props.index, { payoutEuro: Number(input.value || 0) })}
          />
        </label>

        <label class="ui-field">
          <span>{t(i18n, 'distanceKmLabel', 'Distance (km)')}</span>
          <input
            class="ui-input"
            type="number"
            step="0.01"
            value={String(props.row.distanceKm)}
            onInput$={(_, input) => props.onPatch$(props.index, { distanceKm: Number(input.value || 0) })}
          />
        </label>

        <label class="ui-field">
          <span>{t(i18n, 'durationMinutesLabel', 'Estimated time (minutes)')}</span>
          <input
            class="ui-input"
            type="number"
            step="1"
            value={String(props.row.durationMinutes)}
            onInput$={(_, input) =>
              props.onPatch$(props.index, { durationMinutes: Number(input.value || 0) })}
          />
        </label>

        <label class="ui-field">
          <span>{t(i18n, 'bulkDeliveryTimeLabel', 'Delivery time')}</span>
          <input
            class="ui-input"
            type="time"
            value={props.row.deliveryTime}
            onInput$={(_, input) => props.onPatch$(props.index, { deliveryTime: input.value })}
          />
        </label>
      </div>
    </article>
  );
});
