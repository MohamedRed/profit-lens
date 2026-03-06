import { component$ } from '@builder.io/qwik';
import type { BulkParsedRow } from '../../../../../lib/types/bulk-offers';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import { formatCurrencyAmount, formatDistanceKm, formatDurationMinutes } from '../../../../../lib/i18n/number-format';
import type { UserProfile } from '../../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../../lib/types/vehicle';
import { BulkReviewRowAnalysis } from './bulk-review-row-analysis';

interface BulkReviewRowCardProps {
  row: BulkParsedRow;
  index: number;
  locale: string;
  profile: UserProfile | null;
  vehicle: VehicleProfile | null;
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
      </header>

      {routeLabel ? <p class="ui-offer-bulk-row-route">{routeLabel}</p> : null}

      <div class="ui-offer-bulk-row-readonly-grid">
        <div class="ui-offer-bulk-row-readonly-stat">
          <span>{t(i18n, 'offerAmountLabel', 'Payout (EUR)')}</span>
          <strong>{formatCurrencyAmount(props.locale, props.row.payoutEuro)}</strong>
        </div>
        <div class="ui-offer-bulk-row-readonly-stat">
          <span>{t(i18n, 'distanceKmLabel', 'Distance (km)')}</span>
          <strong>{formatDistanceKm(props.locale, props.row.distanceKm, t(i18n, 'distanceUnitKm', 'km'))}</strong>
        </div>
        <div class="ui-offer-bulk-row-readonly-stat">
          <span>{t(i18n, 'durationMinutesLabel', 'Estimated time')}</span>
          <strong>
            {formatDurationMinutes(
              props.locale,
              props.row.durationMinutes,
              t(i18n, 'durationMinutesUnit', 'min'),
            )}
          </strong>
        </div>
        <div class="ui-offer-bulk-row-readonly-stat">
          <span>{t(i18n, 'bulkDeliveryTimeLabel', 'Delivery time')}</span>
          <strong>{props.row.deliveryTime}</strong>
        </div>
        {props.row.tipEuro != null ? (
          <div class="ui-offer-bulk-row-readonly-stat">
            <span>{t(i18n, 'tipAmountLabel', 'Tip (EUR)')}</span>
            <strong>{formatCurrencyAmount(props.locale, props.row.tipEuro)}</strong>
          </div>
        ) : null}
      </div>

      <BulkReviewRowAnalysis row={props.row} profile={props.profile} vehicle={props.vehicle} />
    </article>
  );
});
