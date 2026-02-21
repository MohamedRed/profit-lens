import { describe, expect, it } from "vitest";
import { readRequiredCurrentLocation } from "../src/current_location";
import type { AnalyzeOfferPayload } from "../src/offer_analysis_types";

const readErrorCode = (callback: () => unknown): string | undefined => {
  try {
    callback();
    return undefined;
  } catch (error) {
    return (error as { code?: string }).code;
  }
};

describe("readRequiredCurrentLocation", () => {
  it("returns coordinates when payload has valid currentLocation", () => {
    const payload: AnalyzeOfferPayload = {
      currentLocation: { lat: 48.8566, lng: 2.3522 },
    };

    expect(readRequiredCurrentLocation(payload)).toEqual({
      lat: 48.8566,
      lng: 2.3522,
    });
  });

  it("throws when currentLocation is missing", () => {
    expect(readErrorCode(() => readRequiredCurrentLocation({}))).toBe(
      "failed-precondition"
    );
  });

  it("throws when coordinates are not finite numbers", () => {
    const payload: AnalyzeOfferPayload = {
      currentLocation: { lat: Number.NaN, lng: 2.3522 },
    };

    expect(readErrorCode(() => readRequiredCurrentLocation(payload))).toBe(
      "invalid-argument"
    );
  });

  it("throws when coordinates are out of bounds", () => {
    const payload: AnalyzeOfferPayload = {
      currentLocation: { lat: 95, lng: 2.3522 },
    };

    expect(readErrorCode(() => readRequiredCurrentLocation(payload))).toBe(
      "invalid-argument"
    );
  });
});
