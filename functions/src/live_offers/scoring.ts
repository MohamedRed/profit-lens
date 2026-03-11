import type {
  CostBreakdown,
  CostSettings,
  GeoPoint,
  OfferInput,
  RouteVerification,
  VehicleSnapshot,
} from "../profitability_types";
import { evaluateProfitability } from "../profitability_engine";
import type { LiveOverlayStatus, LiveScoreSummary } from "./types";

export type LiveOfferEvaluation = {
  status: LiveOverlayStatus;
  reasonCode: string | null;
  summary: LiveScoreSummary | null;
  offer: OfferInput | null;
  breakdown: CostBreakdown | null;
};

export async function evaluateLiveOfferScore(params: {
  offer: OfferInput;
  provider: LiveScoreSummary["provider"];
  currentLocation: GeoPoint | null;
  vehicle: VehicleSnapshot;
  costSettings: CostSettings;
  minProfitabilityEuro: number;
  buildRouteVerification: () => Promise<RouteVerification>;
}): Promise<LiveOfferEvaluation> {
  const scoredOffer: OfferInput = {
    ...params.offer,
    routeVerification: params.offer.routeVerification ?? null,
  };

  if (!params.currentLocation) {
    return buildUnknownResult("location_unavailable");
  }

  const needsDistance = !hasPositiveNumber(scoredOffer.distanceKm);
  const needsDuration = !hasPositiveNumber(scoredOffer.durationMinutes);
  if ((needsDistance || needsDuration) && !canVerifyRoute(scoredOffer)) {
    return buildUnknownResult("missing_route_data");
  }

  if (needsDistance || needsDuration) {
    const routeVerification = await params.buildRouteVerification();
    scoredOffer.routeVerification = routeVerification;
    if (needsDistance) {
      scoredOffer.distanceKm = routeVerification.distanceKm;
    }
    if (needsDuration) {
      scoredOffer.durationMinutes = routeVerification.durationMinutes;
    }
  }

  if (!hasPositiveNumber(scoredOffer.distanceKm)) {
    return buildUnknownResult("missing_distance");
  }

  const breakdown = evaluateProfitability({
    offer: scoredOffer,
    vehicle: params.vehicle,
    costs: params.costSettings,
  });
  const minimumTargetEuro = params.minProfitabilityEuro * scoredOffer.distanceKm;
  const profitable = breakdown.netProfit >= minimumTargetEuro;
  return {
    status: profitable ? "profitable" : "not_profitable",
    reasonCode: null,
    summary: {
      provider: params.provider,
      payoutEuro: scoredOffer.payoutEuro,
      distanceKm: scoredOffer.distanceKm,
      durationMinutes: hasPositiveNumber(scoredOffer.durationMinutes)
        ? scoredOffer.durationMinutes
        : null,
      netProfitEuro: breakdown.netProfit,
      minimumTargetEuro,
      profitable,
      pickupAddress: scoredOffer.pickupAddress ?? scoredOffer.pickupName ?? null,
      dropoffAddress: scoredOffer.dropoffAddress ?? scoredOffer.dropoffName ?? null,
    },
    offer: scoredOffer,
    breakdown,
  };
}

function buildUnknownResult(reasonCode: string): LiveOfferEvaluation {
  return {
    status: "unknown",
    reasonCode,
    summary: null,
    offer: null,
    breakdown: null,
  };
}

function canVerifyRoute(offer: OfferInput): boolean {
  return Boolean(
    (offer.pickupAddress ?? offer.pickupName) &&
      (offer.dropoffAddress ?? offer.dropoffName)
  );
}

function hasPositiveNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
