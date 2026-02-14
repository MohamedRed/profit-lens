import {
  onSnapshot,
  orderBy,
  query,
  limit,
  Timestamp,
  type QuerySnapshot,
} from 'firebase/firestore';
import type { OfferInputPayload, OfferRecord, OfferStatsDay } from '../../types/offer';
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
  const routeVerifiedDistanceKm =
    asNumber(routeVerification.distanceKm) ??
    asNumber(routeVerification.distance) ??
    asNumber(offer.distanceKm) ??
    asNumber(data.distanceKm);

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
    routeVerifiedDistanceKm,
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
  vehicleId?: string;
  source?: 'manual' | 'screenshot';
  offer: OfferInputPayload;
}): Promise<Record<string, unknown>> => {
  const payload: Record<string, unknown> = {
    offer: params.offer,
    source: params.source ?? 'manual',
    deviceId: params.deviceId,
  };
  if (params.vehicleId) {
    payload.vehicleId = params.vehicleId;
  }
  return await callAnalyzeOffer(payload);
};

export const analyzeScreenshotOffer = async (params: {
  deviceId: string;
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
