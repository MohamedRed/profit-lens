import { component$ } from '@builder.io/qwik';
import { t, useI18n } from '../../../../../lib/i18n/i18n-context';
import {
  formatCurrencyAmount,
  formatCurrencyPerUnit,
  formatDistanceKm,
  formatDurationMinutes,
} from '../../../../../lib/i18n/number-format';
import type { BulkParsedRow } from '../../../../../lib/types/bulk-offers';
import type { UserProfile } from '../../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../../lib/types/vehicle';
import { buildBulkReviewAnalysisPreview } from '../bulk-review-analysis';

interface BulkReviewRowAnalysisProps {
  row: BulkParsedRow;
  profile: UserProfile | null;
  vehicle: VehicleProfile | null;
}

export const BulkReviewRowAnalysis = component$<BulkReviewRowAnalysisProps>((props) => {
  const i18n = useI18n();
  const locale = i18n.locale.value;

  if (!props.profile || !props.vehicle) {
    return (
      <div class="ui-offer-bulk-row-warning">
        {t(
          i18n,
          'bulkReviewMissingVehicleMessage',
          'Set a default vehicle in Settings to preview the same recommendation logic as single-offer analysis.',
        )}
      </div>
    );
  }

  const preview = buildBulkReviewAnalysisPreview(props.row, props.profile, props.vehicle);
  if (!preview) {
    return (
      <div class="ui-offer-bulk-row-warning">
        {t(
          i18n,
          'bulkReviewMissingSetupMessage',
          'Complete your cost settings to preview profitability for this delivery.',
        )}
      </div>
    );
  }

  const decisionAccept = preview.recommendedAction === 'accept';
  const decisionClass = decisionAccept ? 'ui-offer-decision-accept' : 'ui-offer-decision-decline';
  const decisionLabel = decisionAccept
    ? t(i18n, 'offerDecisionAccept', 'Accept')
    : t(i18n, 'offerDecisionDecline', 'Decline');
  const decisionDetail = decisionAccept
    ? t(i18n, 'offerDecisionAbove', 'Above target by {value}')
    : t(i18n, 'offerDecisionBelow', 'Below target by {value}');
  const distanceUnit = t(i18n, 'distanceUnitKm', 'km');
  const durationUnit = t(i18n, 'durationUnitMinutes', 'min');

  return (
    <div class="ui-offer-bulk-row-analysis">
      <section class={['ui-offer-decision', 'ui-offer-bulk-row-decision', decisionClass]}>
        <h4 class="ui-offer-decision-title">{decisionLabel}</h4>
        <p class="ui-offer-decision-detail">
          {decisionDetail.replace('{value}', formatCurrencyAmount(locale, Math.abs(preview.targetDeltaEuro)))}
        </p>
        <p class="ui-offer-decision-pill">
          {t(i18n, 'minProfitabilityLabel', 'Minimum profit per km')}:{' '}
          {formatCurrencyPerUnit(locale, props.profile.minProfitabilityEuro, distanceUnit)}
        </p>
      </section>

      <div class="ui-offer-bulk-row-stats">
        <div class="ui-offer-bulk-row-stat">
          <span>{t(i18n, 'grossRevenueLabel', 'Gross revenue')}</span>
          <strong>{formatCurrencyAmount(locale, preview.grossRevenueEuro)}</strong>
        </div>
        <div class="ui-offer-bulk-row-stat">
          <span>{t(i18n, 'netProfitLabel', 'Net profit')}</span>
          <strong>{formatCurrencyAmount(locale, preview.netProfitEuro)}</strong>
        </div>
        <div class="ui-offer-bulk-row-stat">
          <span>{t(i18n, 'totalCostsLabel', 'Total costs')}</span>
          <strong>{formatCurrencyAmount(locale, preview.totalCostsEuro)}</strong>
        </div>
        <div class="ui-offer-bulk-row-stat">
          <span>{t(i18n, 'bulkMinimumTargetLabel', 'Minimum target')}</span>
          <strong>{formatCurrencyAmount(locale, preview.minimumTargetEuro)}</strong>
        </div>
        <div class="ui-offer-bulk-row-stat">
          <span>{t(i18n, 'bulkDistanceUsedLabel', 'Distance used')}</span>
          <strong>{formatDistanceKm(locale, props.row.distanceKm, distanceUnit)}</strong>
        </div>
        <div class="ui-offer-bulk-row-stat">
          <span>{t(i18n, 'bulkDurationUsedLabel', 'Time used')}</span>
          <strong>{formatDurationMinutes(locale, props.row.durationMinutes, durationUnit)}</strong>
        </div>
      </div>
    </div>
  );
});
