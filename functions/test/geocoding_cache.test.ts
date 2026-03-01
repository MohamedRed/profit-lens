import { HttpsError } from "firebase-functions/v2/https";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildGeocodeCacheDocId,
  clearGeocodingMemoryCacheForTest,
  normalizeGeocodeAddress,
  resolveGeocodedLocationWithCache,
} from "../src/geocoding_cache";

type SharedEntry = {
  status: "ok" | "no_results";
  expiresAtMs: number;
  lat?: number;
  lng?: number;
};

const createSharedCache = () => {
  const store = new Map<string, SharedEntry>();
  return {
    read: vi.fn(async (docId: string, nowMs: number) => {
      const entry = store.get(docId) ?? null;
      if (!entry || entry.expiresAtMs <= nowMs) {
        return null;
      }
      return { ...entry };
    }),
    write: vi.fn(async (docId: string, entry: SharedEntry) => {
      store.set(docId, { ...entry });
    }),
    set: (docId: string, entry: SharedEntry) => {
      store.set(docId, { ...entry });
    },
  };
};

describe("geocoding_cache", () => {
  beforeEach(() => {
    clearGeocodingMemoryCacheForTest();
  });

  it("normalizes addresses and generates stable v1 cache ids", () => {
    const normalized = normalizeGeocodeAddress("  12  Rue\tDE   la   Paix ");
    expect(normalized).toBe("12 rue de la paix");

    const idA = buildGeocodeCacheDocId(normalized);
    const idB = buildGeocodeCacheDocId(normalized);

    expect(idA).toBe(idB);
    expect(idA.startsWith("v1_")).toBe(true);
  });

  it("uses L1 cache hit and skips L2/API", async () => {
    let now = 1000;
    const shared = createSharedCache();
    const geocodeAddress = vi.fn().mockResolvedValue({
      status: "ok",
      location: { lat: 33.5731, lng: -7.5898 },
    });

    await resolveGeocodedLocationWithCache(
      { apiKey: "k", address: "Casablanca" },
      {
        geocodeAddress,
        nowMs: () => now,
        readSharedCache: shared.read,
        writeSharedCache: shared.write,
      },
    );

    shared.read.mockClear();
    geocodeAddress.mockClear();

    now += 50;
    const location = await resolveGeocodedLocationWithCache(
      { apiKey: "k", address: "Casablanca" },
      {
        geocodeAddress,
        nowMs: () => now,
        readSharedCache: shared.read,
        writeSharedCache: shared.write,
      },
    );

    expect(location).toEqual({ lat: 33.5731, lng: -7.5898 });
    expect(shared.read).not.toHaveBeenCalled();
    expect(geocodeAddress).not.toHaveBeenCalled();
  });

  it("uses L2 cache hit and hydrates L1", async () => {
    const now = 2000;
    const shared = createSharedCache();
    const normalized = normalizeGeocodeAddress("Rabat");
    const docId = buildGeocodeCacheDocId(normalized);
    shared.set(docId, {
      status: "ok",
      lat: 34.0209,
      lng: -6.8416,
      expiresAtMs: now + 10_000,
    });

    const geocodeAddress = vi.fn();

    const first = await resolveGeocodedLocationWithCache(
      { apiKey: "k", address: "Rabat" },
      {
        geocodeAddress,
        nowMs: () => now,
        readSharedCache: shared.read,
        writeSharedCache: shared.write,
      },
    );

    expect(first).toEqual({ lat: 34.0209, lng: -6.8416 });
    expect(shared.read).toHaveBeenCalledTimes(1);
    expect(geocodeAddress).not.toHaveBeenCalled();

    shared.read.mockClear();
    const second = await resolveGeocodedLocationWithCache(
      { apiKey: "k", address: "Rabat" },
      {
        geocodeAddress,
        nowMs: () => now + 100,
        readSharedCache: shared.read,
        writeSharedCache: shared.write,
      },
    );

    expect(second).toEqual({ lat: 34.0209, lng: -6.8416 });
    expect(shared.read).not.toHaveBeenCalled();
  });

  it("calls API on miss and writes through shared cache", async () => {
    const now = 3000;
    const shared = createSharedCache();
    const geocodeAddress = vi.fn().mockResolvedValue({
      status: "ok",
      location: { lat: 35.7595, lng: -5.834 },
    });

    const location = await resolveGeocodedLocationWithCache(
      { apiKey: "k", address: "Tangier" },
      {
        geocodeAddress,
        nowMs: () => now,
        readSharedCache: shared.read,
        writeSharedCache: shared.write,
      },
    );

    expect(location).toEqual({ lat: 35.7595, lng: -5.834 });
    expect(shared.read).toHaveBeenCalledTimes(1);
    expect(geocodeAddress).toHaveBeenCalledTimes(1);
    expect(shared.write).toHaveBeenCalledTimes(1);
  });

  it("treats expired entries as misses and refreshes from API", async () => {
    const shared = createSharedCache();
    const geocodeAddress = vi
      .fn()
      .mockResolvedValueOnce({
        status: "ok",
        location: { lat: 31.7917, lng: -7.0926 },
      })
      .mockResolvedValueOnce({
        status: "ok",
        location: { lat: 31.8017, lng: -7.1026 },
      });

    let now = 5000;
    await resolveGeocodedLocationWithCache(
      { apiKey: "k", address: "Marrakesh" },
      {
        geocodeAddress,
        nowMs: () => now,
        readSharedCache: shared.read,
        writeSharedCache: shared.write,
      },
    );

    now += 31 * 24 * 60 * 60 * 1000;
    const refreshed = await resolveGeocodedLocationWithCache(
      { apiKey: "k", address: "Marrakesh" },
      {
        geocodeAddress,
        nowMs: () => now,
        readSharedCache: shared.read,
        writeSharedCache: shared.write,
      },
    );

    expect(refreshed).toEqual({ lat: 31.8017, lng: -7.1026 });
    expect(geocodeAddress).toHaveBeenCalledTimes(2);
  });

  it("stores ZERO_RESULTS in negative cache and reuses it", async () => {
    let now = 9000;
    const shared = createSharedCache();
    const geocodeAddress = vi.fn().mockResolvedValue({ status: "no_results" });

    await expect(
      resolveGeocodedLocationWithCache(
        { apiKey: "k", address: "Unknown place" },
        {
          geocodeAddress,
          nowMs: () => now,
          readSharedCache: shared.read,
          writeSharedCache: shared.write,
        },
      ),
    ).rejects.toMatchObject({
      code: "internal",
      message: "Geocoding API returned no results.",
    } satisfies Partial<HttpsError>);

    geocodeAddress.mockClear();
    shared.read.mockClear();
    now += 1000;

    await expect(
      resolveGeocodedLocationWithCache(
        { apiKey: "k", address: "Unknown place" },
        {
          geocodeAddress,
          nowMs: () => now,
          readSharedCache: shared.read,
          writeSharedCache: shared.write,
        },
      ),
    ).rejects.toMatchObject({
      code: "internal",
      message: "Geocoding API returned no results.",
    } satisfies Partial<HttpsError>);

    expect(geocodeAddress).not.toHaveBeenCalled();
    expect(shared.read).not.toHaveBeenCalled();
  });
});
