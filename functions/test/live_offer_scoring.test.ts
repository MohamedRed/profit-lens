import { describe, expect, it } from "vitest";
import { evaluateLiveOfferScore } from "../src/live_offers/scoring";

const vehicle = {
  id: "veh_1",
  name: "Bike",
  type: "bike",
  energyType: "fuel",
  energyConsumptionPer100Km: 4,
  energyPricePerUnit: 1.9,
  maintenancePerKm: 0.05,
  depreciationPerKm: 0.03,
};

const costSettings = {
  socialContributionRate: 0.2,
  incomeTaxRate: 0.05,
  fixedCostAllocation: "perKm" as const,
  monthlyFixedCosts: 200,
  monthlyWorkingHours: 120,
  monthlyDistanceKm: 1200,
  monthlyDeliveries: 200,
};

describe("evaluateLiveOfferScore", () => {
  it("returns unknown when location is unavailable", async () => {
    const result = await evaluateLiveOfferScore({
      offer: {
        payoutEuro: 8.5,
        distanceKm: 4,
      },
      provider: "uber_eats",
      currentLocation: null,
      vehicle,
      costSettings,
      minProfitabilityEuro: 1.5,
      buildRouteVerification: async () => {
        throw new Error("route verification should not run");
      },
    });

    expect(result.status).toBe("unknown");
    expect(result.reasonCode).toBe("location_unavailable");
    expect(result.summary).toBeNull();
  });

  it("scores a profitable live offer from visible distance", async () => {
    const result = await evaluateLiveOfferScore({
      offer: {
        payoutEuro: 12,
        distanceKm: 3,
        durationMinutes: 14,
        pickupAddress: "12 Rue Alpha, Paris",
        dropoffAddress: "89 Rue Beta, Paris",
      },
      provider: "deliveroo",
      currentLocation: { lat: 48.8566, lng: 2.3522 },
      vehicle,
      costSettings,
      minProfitabilityEuro: 1.5,
      buildRouteVerification: async () => {
        throw new Error("route verification should not run");
      },
    });

    expect(result.status).toBe("profitable");
    expect(result.reasonCode).toBeNull();
    expect(result.summary?.profitable).toBe(true);
    expect(result.offer?.distanceKm).toBe(3);
    expect(result.breakdown?.netProfit).toBeGreaterThan(0);
  });

  it("uses route verification when the screen is missing distance", async () => {
    const result = await evaluateLiveOfferScore({
      offer: {
        payoutEuro: 5,
        pickupAddress: "12 Rue Alpha, Paris",
        dropoffAddress: "89 Rue Beta, Paris",
      },
      provider: "uber_eats",
      currentLocation: { lat: 48.8566, lng: 2.3522 },
      vehicle,
      costSettings,
      minProfitabilityEuro: 3,
      buildRouteVerification: async () => ({
        distanceKm: 5.5,
        durationMinutes: 19,
        provider: "google_routes",
        travelMode: "BICYCLE",
        verifiedAt: new Date().toISOString(),
      }),
    });

    expect(result.offer?.distanceKm).toBe(5.5);
    expect(result.offer?.routeVerification?.provider).toBe("google_routes");
    expect(result.status).toBe("not_profitable");
  });
});
