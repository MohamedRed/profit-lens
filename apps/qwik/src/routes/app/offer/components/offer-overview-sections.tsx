import { component$, type QRL } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { formatTemplate, t, useI18n } from '../../../../lib/i18n/i18n-context';
import {
  formatCurrencyAmount,
  formatCurrencyPerUnit,
  formatDistanceKm,
  formatDurationMinutes,
} from '../../../../lib/i18n/number-format';
import type { OfferAnalysisRecord } from '../offer-analysis-result';
import { OfferSectionCard } from './offer-section-card';

interface OfferOverviewSectionsProps {
  detailsHref: string;
  minProfitabilityEuro: number;
  onViewDetails$: QRL<() => void | Promise<void>>;
  record: OfferAnalysisRecord;
}

const resolveAnalysisDistanceKm = (record: OfferAnalysisRecord): number => {
  const verifiedDistance = record.offer.routeVerification?.distanceKm;
  if (typeof verifiedDistance === 'number' && Number.isFinite(verifiedDistance) && verifiedDistance > 0) {
    return verifiedDistance;
  }

  const offerDistance = record.offer.distanceKm;
  if (typeof offerDistance === 'number' && Number.isFinite(offerDistance) && offerDistance > 0) {
    return offerDistance;
  }

  return 0;
};

export const OfferOverviewSections = component$<OfferOverviewSectionsProps>((props) => {
  const i18n = useI18n();
  const locale = i18n.locale.value;
  const { detailsHref, minProfitabilityEuro, onViewDetails$, record } = props;
  const distanceUnitKm = t(i18n, 'distanceUnitKm', 'km');
  const durationUnitMinutes = t(i18n, 'durationUnitMinutes', 'min');
  const formatCurrency = (value: number): string => formatCurrencyAmount(locale, value);
  const formatEuroPerKm = (value: number): string => formatCurrencyPerUnit(locale, value, distanceUnitKm);
  const distanceKm = resolveAnalysisDistanceKm(record);
  const minimumTargetEuro = minProfitabilityEuro * distanceKm;
  const targetDelta = record.breakdown.netProfit - minimumTargetEuro;
  const decisionAccept = targetDelta >= 0;
  const decisionLabel = decisionAccept
    ? t(i18n, 'offerDecisionAccept', 'Accept')
    : t(i18n, 'offerDecisionDecline', 'Decline');
  const decisionDetail = decisionAccept
    ? t(i18n, 'offerDecisionAbove', 'Above target by {value}')
    : t(i18n, 'offerDecisionBelow', 'Below target by {value}');
  const decisionClass = decisionAccept ? 'ui-offer-decision-accept' : 'ui-offer-decision-decline';

  return (
    <>
      <section class={['ui-offer-decision', decisionClass]}>
        <h3 class="ui-offer-decision-title">{decisionLabel}</h3>
        <p class="ui-offer-decision-detail">
          {formatTemplate(decisionDetail, {
            amount: formatCurrency(Math.abs(targetDelta)),
            value: formatCurrency(Math.abs(targetDelta)),
          })}
        </p>
        <p class="ui-offer-decision-pill">
          {t(i18n, 'minProfitabilityLabel', 'Minimum profit per km')}: {formatEuroPerKm(minProfitabilityEuro)}
        </p>
      </section>

      <OfferSectionCard title={t(i18n, 'profitabilityOverviewTitle', 'Profitability overview')}>
        <div class="ui-offer-overview">
          <p class={['ui-offer-overview-profit', record.breakdown.netProfit >= 0 ? 'is-positive' : 'is-negative']}>
            {formatCurrency(record.breakdown.netProfit)}
          </p>
          <p class="ui-offer-overview-label">{t(i18n, 'netProfitLabel', 'Net profit')}</p>
          <div class="ui-offer-overview-rows">
            <div class="ui-offer-overview-row">
              <span>{t(i18n, 'grossRevenueLabel', 'Gross revenue')}</span>
              <span>{formatCurrency(record.offer.payoutEuro)}</span>
            </div>
            {record.offer.routeVerification ? (
              <>
                <div class="ui-offer-overview-row">
                  <span>{t(i18n, 'verifiedDistanceLabel', 'Verified distance')}</span>
                  <span>{formatDistanceKm(locale, record.offer.routeVerification.distanceKm, distanceUnitKm)}</span>
                </div>
                <div class="ui-offer-overview-row">
                  <span>{t(i18n, 'verifiedDurationLabel', 'Verified duration')}</span>
                  <span>
                    {formatDurationMinutes(locale, record.offer.routeVerification.durationMinutes, durationUnitMinutes)}
                  </span>
                </div>
              </>
            ) : null}
            <div class="ui-offer-overview-row">
              <span>{t(i18n, 'totalCostsLabel', 'Total costs')}</span>
              <span>{formatCurrency(record.breakdown.totalCosts)}</span>
            </div>
          </div>
          <Link class="ui-button ui-button-default ui-button-md" href={detailsHref} onClick$={onViewDetails$}>
            {t(i18n, 'viewProfitabilityDetailsButton', 'View profitability details')}
          </Link>
        </div>
      </OfferSectionCard>
    </>
  );
});
