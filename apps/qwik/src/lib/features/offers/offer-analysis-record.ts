export interface OfferAnalysisRecord {
  id: string;
  source: string;
  createdAt: string;
  offer: {
    payoutEuro: number;
    distanceKm?: number | null;
    durationMinutes?: number | null;
    pickupName?: string | null;
    pickupAddress?: string | null;
    dropoffName?: string | null;
    dropoffAddress?: string | null;
    routeVerification?: {
      distanceKm: number;
      durationMinutes: number;
      travelMode?: string;
      provider?: string;
    } | null;
  };
  breakdown: {
    totalCosts: number;
    netProfit: number;
  };
}

const asObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as Record<string, unknown>;
};

const asNumber = (value: unknown): number => {
  return typeof value === 'number' ? value : Number(value ?? 0);
};

const asNonEmptyString = (value: unknown): string | null => {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : null;
};

export const parseOfferAnalysisRecord = (
  payload: Record<string, unknown>,
): OfferAnalysisRecord | null => {
  const record = asObject(payload.record);
  if (!record) {
    return null;
  }

  const offer = asObject(record.offer);
  const breakdown = asObject(record.breakdown);
  if (!offer || !breakdown) {
    return null;
  }
  const id = asNonEmptyString(record.id);
  if (!id) {
    return null;
  }

  const routeVerification = asObject(offer.routeVerification);

  return {
    id,
    source: String(record.source ?? 'manual'),
    createdAt: String(record.createdAt ?? ''),
    offer: {
      payoutEuro: asNumber(offer.payoutEuro),
      distanceKm: offer.distanceKm == null ? null : asNumber(offer.distanceKm),
      durationMinutes:
        offer.durationMinutes == null ? null : asNumber(offer.durationMinutes),
      pickupName: (offer.pickupName as string | null | undefined) ?? null,
      pickupAddress: (offer.pickupAddress as string | null | undefined) ?? null,
      dropoffName: (offer.dropoffName as string | null | undefined) ?? null,
      dropoffAddress:
        (offer.dropoffAddress as string | null | undefined) ?? null,
      routeVerification: routeVerification
        ? {
            distanceKm: asNumber(routeVerification.distanceKm),
            durationMinutes: asNumber(routeVerification.durationMinutes),
            travelMode: (routeVerification.travelMode as string | undefined) ?? undefined,
            provider: (routeVerification.provider as string | undefined) ?? undefined,
          }
        : null,
    },
    breakdown: {
      totalCosts: asNumber(breakdown.totalCosts),
      netProfit: asNumber(breakdown.netProfit),
    },
  };
};
