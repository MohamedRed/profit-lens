import { component$, type PropFunction } from '@builder.io/qwik';
import type { BulkParsedRow } from '../../../../../lib/types/bulk-offers';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../../lib/types/vehicle';
import { BulkReviewRowAnalysis } from './bulk-review-row-analysis';

interface BulkReviewRowCardProps {
  row: BulkParsedRow;
  index: number;
  profile: UserProfile | null;
  vehicle: VehicleProfile | null;
  onPatch$: PropFunction<(index: number, patch: Partial<BulkParsedRow>) => void>;
  onRemove$: PropFunction<(index: number) => void>;
}

export const BulkReviewRowCard = component$<BulkReviewRowCardProps>((props) => {
  const i18n = useI18n();
  const routeLabel = [props.row.pickupName, props.row.dropoffName].filter(Boolean).join(' -> ');

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

      {routeLabel ? <p class="ui-offer-bulk-row-route">{routeLabel}</p> : null}

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
          <span>{t(i18n, 'tipAmountLabel', 'Tip (EUR)')}</span>
          <input
            class="ui-input"
            type="number"
            step="0.01"
            value={props.row.tipEuro == null ? '' : String(props.row.tipEuro)}
            onInput$={(_, input) =>
              props.onPatch$(props.index, {
                tipEuro: input.value.trim() === '' ? null : Number(input.value),
              })}
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

      <BulkReviewRowAnalysis row={props.row} profile={props.profile} vehicle={props.vehicle} />
    </article>
  );
});
