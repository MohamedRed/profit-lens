import {
  onSnapshot,
  orderBy,
  query,
  limit,
  getDocs,
  startAfter,
  doc,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from 'firebase/firestore';
import type {
  OfferCurrentLocation,
  OfferInputPayload,
  OfferRecord,
  OfferStatsDay,
} from '../../types/offer';
import { userCollection } from '../../firebase/firestore';
import { callAnalyzeOffer, callVerifyOfferRoute } from '../../firebase/callables';

const asDate = (value: unknown): Date | null => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const mapOffer = (docId: string, data: Record<string, unknown>): OfferRecord => {
  const breakdown = (data.breakdown as Record<string, unknown> | undefined) ?? {};
  const offer = (data.offer as Record<string, unknown> | undefined) ?? data;
  const routeVerification =
    (offer.routeVerification as Record<string, unknown> | undefined) ??
    (data.routeVerification as Record<string, unknown> | undefined) ??
    {};
  const payoutEuro = asNumber(offer.payoutEuro) ?? asNumber(data.payoutEuro) ?? 0;
  const distanceKm = asNumber(offer.distanceKm) ?? asNumber(data.distanceKm) ?? 0;
  const durationMinutes = asNumber(offer.durationMinutes) ?? asNumber(data.durationMinutes) ?? 0;
  const netProfitEuro =
    asNumber(breakdown.netProfitEuro) ??
    asNumber(breakdown.netProfit) ??
    asNumber(data.netProfitEuro) ??
    asNumber(data.netProfit) ??
    0;
  const totalCostsEuro =
    asNumber(breakdown.totalCostsEuro) ??
    asNumber(breakdown.totalCosts) ??
    asNumber(data.totalCostsEuro) ??
    asNumber(data.totalCosts) ??
    0;
  const energyCostEuro =
    asNumber(breakdown.energyCostEuro) ??
    asNumber(breakdown.energyCost) ??
    asNumber(data.energyCostEuro) ??
    asNumber(data.energyCost);
  const maintenanceCostEuro =
    asNumber(breakdown.maintenanceCostEuro) ??
    asNumber(breakdown.maintenanceCost) ??
    asNumber(data.maintenanceCostEuro) ??
    asNumber(data.maintenanceCost);
  const depreciationCostEuro =
    asNumber(breakdown.depreciationCostEuro) ??
    asNumber(breakdown.depreciationCost) ??
    asNumber(data.depreciationCostEuro) ??
    asNumber(data.depreciationCost);
  const socialContributionsEuro =
    asNumber(breakdown.socialContributionsEuro) ??
    asNumber(breakdown.socialContributions) ??
    asNumber(data.socialContributionsEuro) ??
    asNumber(data.socialContributions);
  const incomeTaxEuro =
    asNumber(breakdown.incomeTaxEuro) ??
    asNumber(breakdown.incomeTax) ??
    asNumber(data.incomeTaxEuro) ??
    asNumber(data.incomeTax);
  const fixedCostAllocationEuro =
    asNumber(breakdown.fixedCostAllocationEuro) ??
    asNumber(breakdown.fixedCostAllocation) ??
    asNumber(data.fixedCostAllocationEuro) ??
    asNumber(data.fixedCostAllocation);
  const routeVerifiedDistanceKm =
    asNumber(routeVerification.distanceKm) ??
    asNumber(routeVerification.distance) ??
    asNumber(offer.distanceKm) ??
    asNumber(data.distanceKm);
  const routeVerifiedDurationMinutes =
    asNumber(routeVerification.durationMinutes) ??
    asNumber(routeVerification.duration) ??
    asNumber(offer.durationMinutes) ??
    asNumber(data.durationMinutes);

  return {
    id: docId,
    source: (data.source as string) ?? 'manual',
    createdAt: asDate(data.createdAt),
    payoutEuro,
    distanceKm,
    durationMinutes,
    pickupName: (offer.pickupName as string | undefined) ?? (data.pickupName as string | undefined),
    pickupAddress:
      (offer.pickupAddress as string | undefined) ?? (data.pickupAddress as string | undefined),
    dropoffName: (offer.dropoffName as string | undefined) ?? (data.dropoffName as string | undefined),
    dropoffAddress:
      (offer.dropoffAddress as string | undefined) ?? (data.dropoffAddress as string | undefined),
    netProfitEuro,
    totalCostsEuro,
    energyCostEuro,
    maintenanceCostEuro,
    depreciationCostEuro,
    socialContributionsEuro,
    incomeTaxEuro,
    fixedCostAllocationEuro,
    routeVerifiedDistanceKm,
    routeVerifiedDurationMinutes,
  };
};

const mapStats = (data: Record<string, unknown>): OfferStatsDay | null => {
  const dayStart = asDate(data.dayStart);
  if (!dayStart) {
    return null;
  }
  const offerCount = asNumber(data.offerCount) ?? asNumber(data.count) ?? 0;
  const netProfitEuro =
    asNumber(data.totalNetProfitEuro) ??
    asNumber(data.netProfitEuro) ??
    asNumber(data.netProfitSum) ??
    0;

  return {
    dayStart,
    offerCount,
    netProfitEuro,
  };
};

export const watchOffers = (
  uid: string,
  callback: (offers: OfferRecord[]) => void,
): (() => void) => {
  const offersQuery = query(userCollection(uid, 'offers'), orderBy('createdAt', 'desc'));
  return onSnapshot(offersQuery, (snapshot: QuerySnapshot) => {
    const offers = snapshot.docs.map((doc) => {
      return mapOffer(doc.id, doc.data() as Record<string, unknown>);
    });
    callback(offers);
  });
};

export type OffersPageCursor = QueryDocumentSnapshot<DocumentData>;

export interface OffersPage {
  offers: OfferRecord[];
  cursor: OffersPageCursor | null;
  hasMore: boolean;
}

export const fetchOffersPage = async (params: {
  uid: string;
  limitCount?: number;
  cursor?: OffersPageCursor | null;
}): Promise<OffersPage> => {
  const limitCount = params.limitCount ?? 15;
  const offersRef = userCollection(params.uid, 'offers');

  const offersQuery =
    params.cursor
      ? query(offersRef, orderBy('createdAt', 'desc'), startAfter(params.cursor), limit(limitCount))
      : query(offersRef, orderBy('createdAt', 'desc'), limit(limitCount));

  const snapshot = await getDocs(offersQuery);
  const offers = snapshot.docs.map((doc) => {
    return mapOffer(doc.id, doc.data() as Record<string, unknown>);
  });

  return {
    offers,
    cursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null,
    hasMore: snapshot.docs.length === limitCount,
  };
};

export const watchOfferById = (
  uid: string,
  offerId: string,
  callback: (offer: OfferRecord | null) => void,
): (() => void) => {
  const offerRef = doc(userCollection(uid, 'offers'), offerId);
  return onSnapshot(offerRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback(mapOffer(snapshot.id, snapshot.data() as Record<string, unknown>));
  });
};

export const watchOfferStats = (
  uid: string,
  callback: (stats: OfferStatsDay[]) => void,
): (() => void) => {
  const statsQuery = query(
    userCollection(uid, 'offerStats'),
    orderBy('dayStart', 'desc'),
    limit(90),
  );
  return onSnapshot(statsQuery, (snapshot: QuerySnapshot) => {
    const stats = snapshot.docs
      .map((doc) => mapStats(doc.data() as Record<string, unknown>))
      .filter((value): value is OfferStatsDay => value !== null);
    callback(stats);
  });
};

export const analyzeManualOffer = async (params: {
  deviceId: string;
  currentLocation: OfferCurrentLocation;
  vehicleId?: string;
  source?: 'manual' | 'screenshot';
  offer: OfferInputPayload;
}): Promise<Record<string, unknown>> => {
  const payload: Record<string, unknown> = {
    offer: params.offer,
    source: params.source ?? 'manual',
    deviceId: params.deviceId,
    currentLocation: params.currentLocation,
  };
  if (params.vehicleId) {
    payload.vehicleId = params.vehicleId;
  }
  return await callAnalyzeOffer(payload);
};

export const analyzeScreenshotOffer = async (params: {
  deviceId: string;
  currentLocation: OfferCurrentLocation;
  file: File;
  vehicleId?: string;
}): Promise<Record<string, unknown>> => {
  const bytes = await params.file.arrayBuffer();
  const uint8 = new Uint8Array(bytes);
  let binary = '';
  for (let index = 0; index < uint8.length; index += 1) {
    binary += String.fromCharCode(uint8[index]);
  }
  const payload: Record<string, unknown> = {
    imageBase64: btoa(binary),
    mimeType: params.file.type,
    source: 'screenshot',
    deviceId: params.deviceId,
    currentLocation: params.currentLocation,
  };
  if (params.vehicleId) {
    payload.vehicleId = params.vehicleId;
  }
  return await callAnalyzeOffer(payload);
};

export const verifyOfferRoute = async (params: {
  pickupAddress: string;
  dropoffAddress: string;
}) => {
  return await callVerifyOfferRoute({
    pickupAddress: params.pickupAddress,
    dropoffAddress: params.dropoffAddress,
  });
};
