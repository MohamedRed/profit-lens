import { describe, expect, it } from "vitest";
import {
  normalizeDeliveryTime,
  normalizeExtractedOfferCandidate,
  parseFlexibleNumber,
} from "../src/offer_extraction_core/normalization";

describe("offer extraction core normalization", () => {
  it("parses locale decimal strings", () => {
    expect(parseFlexibleNumber("15,57 €")).toBeCloseTo(15.57);
    expect(parseFlexibleNumber("1,234.5")).toBeCloseTo(1234.5);
  });

  it("normalizes delivery time", () => {
    expect(normalizeDeliveryTime("8:17")).toBe("08:17");
    expect(normalizeDeliveryTime("23:59")).toBe("23:59");
    expect(normalizeDeliveryTime("28:11")).toBeNull();
  });

  it("normalizes extracted row fields", () => {
    const normalized = normalizeExtractedOfferCandidate({
      payoutEuro: "8,06",
      distanceKm: "8.74",
      durationMinutes: "31",
      deliveryTime: "11:53",
      tipEuro: "2,50",
      pickupName: "Pata Pita ",
    });
    expect(normalized.payoutEuro).toBeCloseTo(8.06);
    expect(normalized.distanceKm).toBeCloseTo(8.74);
    expect(normalized.durationMinutes).toBe(31);
    expect(normalized.deliveryTime).toBe("11:53");
    expect(normalized.tipEuro).toBeCloseTo(2.5);
    expect(normalized.pickupName).toBe("Pata Pita");
  });
});
