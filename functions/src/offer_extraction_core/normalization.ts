import { OfferInput } from "../profitability_types";
import { ExtractedOfferCandidate, NormalizedOfferRow } from "./types";

const DELIVERY_TIME_REGEX = /^(2[0-3]|[01]?\d):([0-5]\d)$/;

export function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

export function parseFlexibleNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const cleaned = trimmed
    .replace(/\s+/g, "")
    .replace(/[€$£]/g, "")
    .replace(/[^\d,.-]/g, "");
  if (!cleaned) {
    return null;
  }

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");
  let normalized = cleaned;
  if (hasComma && hasDot) {
    normalized = cleaned.replace(/,/g, "");
  } else if (hasComma) {
    normalized = cleaned.replace(",", ".");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeDeliveryTime(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const hour = Math.floor(value / 100);
    const minute = value % 100;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return null;
    }
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }
  if (typeof value !== "string") {
    return null;
  }
  const candidate = value.trim().replace(/\s+/g, "");
  const match = candidate.match(DELIVERY_TIME_REGEX);
  if (!match) {
    return null;
  }
  return `${match[1]!.padStart(2, "0")}:${match[2]}`;
}

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
  if (!input) {
    return null;
  }
  const confidence = toNumber(input.confidence);
  if (confidence == null) {
    return null;
  }
  return {
    confidence,
    rawText: normalizeString(input.rawText),
  };
}

export function normalizeExtractedOfferCandidate(
  candidate: ExtractedOfferCandidate
): NormalizedOfferRow {
  return {
    payoutEuro: parseFlexibleNumber(candidate.payoutEuro),
    distanceKm: parseFlexibleNumber(candidate.distanceKm),
    durationMinutes: parseFlexibleNumber(candidate.durationMinutes),
    deliveryTime: normalizeDeliveryTime(candidate.deliveryTime),
    pickupName: normalizeString(candidate.pickupName),
    pickupAddress: normalizeString(candidate.pickupAddress),
    dropoffName: normalizeString(candidate.dropoffName),
    dropoffAddress: normalizeString(candidate.dropoffAddress),
    tipEuro: parseFlexibleNumber(candidate.tipEuro),
    confidence: parseFlexibleNumber(candidate.confidence),
  };
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
