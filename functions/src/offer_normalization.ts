import { OfferInput } from "./profitability_types";

export function normalizeOffer(input?: OfferInput): OfferInput | null {
  if (!input) {
    return null;
  }
  const payout = toNumber(input.payoutEuro);
  const distance = toNumber(input.distanceKm);
  if (payout == null) {
    return null;
  }
  return {
    payoutEuro: payout,
    distanceKm: distance ?? null,
    durationMinutes: toNumber(input.durationMinutes),
    pickupName: normalizeString(input.pickupName),
    pickupAddress: normalizeString(input.pickupAddress),
    dropoffName: normalizeString(input.dropoffName),
    dropoffAddress: normalizeString(input.dropoffAddress),
    routeVerification: input.routeVerification ?? undefined,
  };
}

export function normalizeExtraction(input?: {
  confidence?: number;
  rawText?: string | null;
}) {
  if (!input) return null;
  const confidence = toNumber(input.confidence);
  if (confidence == null) return null;
  return {
    confidence,
    rawText: normalizeString(input.rawText),
  };
}

export function normalizeString(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length == 0 ? null : trimmed;
}

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

export function mergeOfferInputs(
  baseOffer: OfferInput,
  override?: OfferInput | null
): OfferInput {
  if (!override) {
    return baseOffer;
  }
  return {
    payoutEuro: override.payoutEuro ?? baseOffer.payoutEuro,
    distanceKm: override.distanceKm ?? baseOffer.distanceKm,
    durationMinutes: override.durationMinutes ?? baseOffer.durationMinutes,
    pickupName: override.pickupName ?? baseOffer.pickupName,
    pickupAddress: override.pickupAddress ?? baseOffer.pickupAddress,
    dropoffName: override.dropoffName ?? baseOffer.dropoffName,
    dropoffAddress: override.dropoffAddress ?? baseOffer.dropoffAddress,
    routeVerification: override.routeVerification ?? baseOffer.routeVerification,
  };
}
