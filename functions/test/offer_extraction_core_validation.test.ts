import { describe, expect, it } from "vitest";
import { validateNormalizedOfferRow } from "../src/offer_extraction_core/validation";

describe("offer extraction core validation", () => {
  it("returns required field errors", () => {
    const issues = validateNormalizedOfferRow({
      payoutEuro: null,
      distanceKm: null,
      durationMinutes: null,
      deliveryTime: null,
      pickupName: null,
      pickupAddress: null,
      dropoffName: null,
      dropoffAddress: null,
      tipEuro: null,
      confidence: null,
    });
    expect(issues.map((issue) => issue.code)).toEqual([
      "missing-payout",
      "missing-distance",
      "missing-duration",
      "missing-time",
    ]);
  });

  it("accepts complete rows", () => {
    const issues = validateNormalizedOfferRow({
      payoutEuro: 8.06,
      distanceKm: 8.74,
      durationMinutes: 31,
      deliveryTime: "11:53",
      pickupName: null,
      pickupAddress: null,
      dropoffName: null,
      dropoffAddress: null,
      tipEuro: null,
      confidence: 0.9,
    });
    expect(issues).toHaveLength(0);
  });
});
