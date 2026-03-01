import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../src/routes_api", () => {
  return {
    computeRoute: vi.fn(),
  };
});

vi.mock("../src/geocoding_cache", () => {
  return {
    resolveGeocodedLocationWithCache: vi.fn(),
  };
});

import { verifyRoute, verifyRouteLegs } from "../src/route_verification";
import { computeRoute } from "../src/routes_api";
import { resolveGeocodedLocationWithCache } from "../src/geocoding_cache";

describe("route_verification", () => {
  const computeRouteMock = vi.mocked(computeRoute);
  const resolveGeocodedLocationWithCacheMock = vi.mocked(
    resolveGeocodedLocationWithCache,
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("verifies a route using cached geocoded addresses", async () => {
    resolveGeocodedLocationWithCacheMock
      .mockResolvedValueOnce({ lat: 48.8566, lng: 2.3522 })
      .mockResolvedValueOnce({ lat: 43.2965, lng: 5.3698 });
    computeRouteMock.mockResolvedValue({
      distanceMeters: 12345,
      durationSeconds: 1800,
    });

    const result = await verifyRoute({
      apiKey: "routes-key",
      geocodingKey: "geocode-key",
      origin: { address: "Paris" },
      destination: { address: "Marseille" },
      travelMode: "DRIVE",
    });

    expect(resolveGeocodedLocationWithCacheMock).toHaveBeenCalledTimes(2);
    expect(resolveGeocodedLocationWithCacheMock).toHaveBeenNthCalledWith(1, {
      apiKey: "geocode-key",
      address: "Paris",
    });
    expect(resolveGeocodedLocationWithCacheMock).toHaveBeenNthCalledWith(2, {
      apiKey: "geocode-key",
      address: "Marseille",
    });
    expect(result).toEqual({
      distanceKm: 12.345,
      durationMinutes: 30,
      provider: "google_routes",
      travelMode: "DRIVE",
      verifiedAt: result.verifiedAt,
    });
  });

  it("verifies approach and delivery legs with unchanged metric conversion", async () => {
    resolveGeocodedLocationWithCacheMock
      .mockResolvedValueOnce({ lat: 33.5899, lng: -7.6039 })
      .mockResolvedValueOnce({ lat: 33.9716, lng: -6.8498 });
    computeRouteMock
      .mockResolvedValueOnce({
        distanceMeters: 2800,
        durationSeconds: 420,
      })
      .mockResolvedValueOnce({
        distanceMeters: 9100,
        durationSeconds: 1500,
      });

    const result = await verifyRouteLegs({
      apiKey: "routes-key",
      geocodingKey: "geocode-key",
      currentLocation: { lat: 33.5731, lng: -7.5898 },
      pickup: { address: "Pickup Address" },
      dropoff: { address: "Dropoff Address" },
      travelMode: "TWO_WHEELER",
    });

    expect(result).toEqual({
      approach: {
        distanceKm: 2.8,
        durationMinutes: 7,
      },
      delivery: {
        distanceKm: 9.1,
        durationMinutes: 25,
      },
    });
  });

  it("bypasses geocoding when coordinates are already provided", async () => {
    computeRouteMock.mockResolvedValue({
      distanceMeters: 1000,
      durationSeconds: 600,
    });

    await verifyRoute({
      apiKey: "routes-key",
      geocodingKey: "geocode-key",
      origin: { latLng: { lat: 48.8566, lng: 2.3522 } },
      destination: { latLng: { lat: 45.764, lng: 4.8357 } },
      travelMode: "DRIVE",
    });

    expect(resolveGeocodedLocationWithCacheMock).not.toHaveBeenCalled();
  });
});
