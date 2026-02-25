import { saveExplicitBackTarget } from '../../../lib/navigation/explicit-back-target';
import { saveTabScrollY } from '../../../lib/navigation/tab-scroll-memory';
import type { OfferRecord } from '../../../lib/types/offer';
import type { OfferAnalysisRecord } from './offer-analysis-result';
import { saveSelectedHistoryOfferId, upsertHistoryOfferCache } from '../history/history-offer-cache';

const toOfferRecord = (record: OfferAnalysisRecord): OfferRecord => {
  const parsedCreatedAt = new Date(record.createdAt);
  const createdAt = Number.isNaN(parsedCreatedAt.getTime()) ? null : parsedCreatedAt;
  const routeVerification = record.offer.routeVerification;

  return {
    id: record.id,
    source: record.source,
    createdAt,
    payoutEuro: record.offer.payoutEuro,
    distanceKm: routeVerification?.distanceKm ?? record.offer.distanceKm ?? 0,
    durationMinutes: record.offer.durationMinutes ?? undefined,
    routeVerifiedDistanceKm: routeVerification?.distanceKm,
    routeVerifiedDurationMinutes: routeVerification?.durationMinutes,
    pickupName: record.offer.pickupName ?? undefined,
    pickupAddress: record.offer.pickupAddress ?? undefined,
    dropoffName: record.offer.dropoffName ?? undefined,
    dropoffAddress: record.offer.dropoffAddress ?? undefined,
    netProfitEuro: record.breakdown.netProfit,
    totalCostsEuro: record.breakdown.totalCosts,
  };
};

export const primeOfferDetailsNavigation = (
  record: OfferAnalysisRecord,
  scrollY: number | null,
): void => {
  try {
    if (typeof scrollY === 'number' && Number.isFinite(scrollY)) {
      saveTabScrollY('app/offer', scrollY);
    }
    saveSelectedHistoryOfferId(record.id);
    upsertHistoryOfferCache(toOfferRecord(record));
    saveExplicitBackTarget('history/details', '/next/app/offer');
  } catch (error) {
    void error;
  }
};
