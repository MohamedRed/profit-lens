import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useLocation } from '@builder.io/qwik-city';
import { Separator } from '../../../../components/ui/separator';
import { useAuth } from '../../../../lib/auth/auth-context';
import { watchOfferById } from '../../../../lib/features/offers/offers-service';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { OfferRecord } from '../../../../lib/types/offer';
import { formatCurrency, formatShortDateTime } from '../history-helpers';
import {
  readHistoryOfferFromCache,
  readSelectedHistoryOfferId,
  saveSelectedHistoryOfferId,
  upsertHistoryOfferCache,
} from '../history-offer-cache';

const formatDistance = (value: number): string => {
  return `${value.toFixed(1)} km`;
};

const formatDuration = (value: number, unit: string): string => {
  return `${Math.round(value).toString()} ${unit}`;
};

const readOfferIdFromPath = (path: string): string | null => {
  const match = path.match(/\/app\/history\/([^/]+)\/?$/);
  if (!match) {
    return null;
  }
  if (match[1] === 'details') {
    return null;
  }
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

export default component$(() => {
  const location = useLocation();
  const auth = useAuth();
  const i18n = useI18n();
  const offer = useSignal<OfferRecord | null>(null);
  const loading = useSignal(true);

  useVisibleTask$(({ track, cleanup }) => {
    const user = track(() => auth.user.value);
    const search = track(() => location.url.search);
    const path = track(() => location.url.pathname);
    const offerId =
      new URLSearchParams(search).get('offerId') ??
      readOfferIdFromPath(path) ??
      readSelectedHistoryOfferId();
    if (!offerId) {
      offer.value = null;
      loading.value = false;
      return;
    }

    saveSelectedHistoryOfferId(offerId);

    const cachedOffer = readHistoryOfferFromCache(offerId);
    if (cachedOffer) {
      offer.value = cachedOffer;
    }

    if (!user) {
      loading.value = cachedOffer === null;
      return;
    }

    loading.value = cachedOffer === null;
    const unsubscribe = watchOfferById(user.uid, offerId, (item) => {
      if (item) {
        offer.value = item;
        upsertHistoryOfferCache(item);
      } else if (!cachedOffer) {
        offer.value = null;
      }
      loading.value = false;
    });
    cleanup(() => {
      unsubscribe();
    });
  });

  const locale = i18n.locale.value;
  const current = offer.value;

  if (loading.value) {
    return <p class="ui-history-empty">{t(i18n, 'loadingLabel', 'Loading...')}</p>;
  }

  if (!current) {
    return (
      <div class="ui-history-detail-root">
        <p class="ui-history-empty">{t(i18n, 'noHistoryMessage', 'No offers saved yet.')}</p>
      </div>
    );
  }

  const profit = current.netProfitEuro ?? 0;
  const distance = current.routeVerifiedDistanceKm ?? current.distanceKm;
  const duration = current.routeVerifiedDurationMinutes ?? current.durationMinutes;

  return (
    <div class="ui-history-detail-root">
      <section class="ui-history-detail-card">
        <p class={{ 'ui-history-detail-profit': true, 'is-positive': profit >= 0, 'is-negative': profit < 0 }}>
          {formatCurrency(locale, profit)}
        </p>
        <p class="ui-history-detail-caption">{t(i18n, 'netProfitLabel', 'Net profit')}</p>

        <div class="ui-history-detail-row">
          <span>{t(i18n, 'analysisDateLabel', 'Analysis date')}</span>
          <span>{formatShortDateTime(locale, current.createdAt)}</span>
        </div>
        <div class="ui-history-detail-row">
          <span>{t(i18n, 'grossRevenueLabel', 'Gross revenue')}</span>
          <span>{formatCurrency(locale, current.payoutEuro)}</span>
        </div>
        <div class="ui-history-detail-row">
          <span>{t(i18n, 'verifiedDistanceLabel', 'Verified distance')}</span>
          <span>{formatDistance(distance)}</span>
        </div>
        {typeof duration === 'number' ? (
          <div class="ui-history-detail-row">
            <span>{t(i18n, 'verifiedDurationLabel', 'Verified time')}</span>
            <span>{formatDuration(duration, t(i18n, 'durationUnitMinutes', 'min'))}</span>
          </div>
        ) : null}

        <div class="ui-history-detail-row">
          <span>{t(i18n, 'energyCostLabel', 'Energy cost')}</span>
          <span>{formatCurrency(locale, current.energyCostEuro ?? 0)}</span>
        </div>
        <div class="ui-history-detail-row">
          <span>{t(i18n, 'maintenanceCostLabel', 'Maintenance')}</span>
          <span>{formatCurrency(locale, current.maintenanceCostEuro ?? 0)}</span>
        </div>
        <div class="ui-history-detail-row">
          <span>{t(i18n, 'depreciationCostLabel', 'Depreciation')}</span>
          <span>{formatCurrency(locale, current.depreciationCostEuro ?? 0)}</span>
        </div>
        <div class="ui-history-detail-row">
          <span>{t(i18n, 'socialContributionLabel', 'Social contributions')}</span>
          <span>{formatCurrency(locale, current.socialContributionsEuro ?? 0)}</span>
        </div>
        <div class="ui-history-detail-row">
          <span>{t(i18n, 'incomeTaxLabel', 'Income tax')}</span>
          <span>{formatCurrency(locale, current.incomeTaxEuro ?? 0)}</span>
        </div>
        <div class="ui-history-detail-row">
          <span>{t(i18n, 'fixedCostsLabel', 'Fixed costs allocation')}</span>
          <span>{formatCurrency(locale, current.fixedCostAllocationEuro ?? 0)}</span>
        </div>
        <Separator class="ui-history-detail-divider" />
        <div class="ui-history-detail-row">
          <span>{t(i18n, 'totalCostsLabel', 'Total costs')}</span>
          <span>{formatCurrency(locale, current.totalCostsEuro ?? 0)}</span>
        </div>
      </section>
    </div>
  );
});
