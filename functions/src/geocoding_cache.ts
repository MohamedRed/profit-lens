import { createHash } from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase_admin";
import {
  GeocodeAddressResult,
  GeocodedLocation,
  geocodeAddressResult,
} from "./geocoding_api";

export type GeocodeCacheStatus = "ok" | "no_results";

type GeocodeCacheEntry = {
  status: GeocodeCacheStatus;
  lat?: number;
  lng?: number;
  expiresAtMs: number;
};

type SharedCacheWriterPayload = {
  expiresAt: Timestamp;
  lat?: number;
  lng?: number;
  status: GeocodeCacheStatus;
  updatedAt: Timestamp;
  version: number;
};

type GeocodingCacheDependencies = {
  geocodeAddress?: (params: {
    address: string;
    apiKey: string;
  }) => Promise<GeocodeAddressResult>;
  logInfo?: (message: string, data: Record<string, unknown>) => void;
  nowMs?: () => number;
  readSharedCache?: (docId: string, nowMs: number) => Promise<GeocodeCacheEntry | null>;
  writeSharedCache?: (
    docId: string,
    entry: GeocodeCacheEntry,
    nowMs: number,
  ) => Promise<void>;
};

const CACHE_COLLECTION = "systemGeocodeCache";
const CACHE_KEY_VERSION = "v1";
const CACHE_SCHEMA_VERSION = 1;
const POSITIVE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const NEGATIVE_TTL_MS = 6 * 60 * 60 * 1000;

const inMemoryCache = new Map<string, GeocodeCacheEntry>();

export const normalizeGeocodeAddress = (address: string): string => {
  return address.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
};

export const buildGeocodeCacheDocId = (normalizedAddress: string): string => {
  const hash = createHash("sha256").update(normalizedAddress, "utf8").digest("hex");
  return `${CACHE_KEY_VERSION}_${hash}`;
};

export const clearGeocodingMemoryCacheForTest = (): void => {
  inMemoryCache.clear();
};

export async function resolveGeocodedLocationWithCache(
  params: { address: string; apiKey: string },
  dependencies: GeocodingCacheDependencies = {},
): Promise<GeocodedLocation> {
  const normalizedAddress = normalizeGeocodeAddress(params.address);
  if (!normalizedAddress) {
    throw new HttpsError("invalid-argument", "Missing route location.");
  }

  const now = dependencies.nowMs ?? Date.now;
  const logInfo = dependencies.logInfo ?? ((message, data) => logger.info(message, data));
  const readSharedCache = dependencies.readSharedCache ?? readSharedGeocodeCache;
  const writeSharedCache = dependencies.writeSharedCache ?? writeSharedGeocodeCache;
  const geocode = dependencies.geocodeAddress ?? geocodeAddressResult;
  const nowMs = now();
  const docId = buildGeocodeCacheDocId(normalizedAddress);

  const memoryEntry = readMemoryGeocodeCache(docId, nowMs);
  if (memoryEntry) {
    if (memoryEntry.status === "no_results") {
      logGeocodeCacheEvent(logInfo, {
        cacheLayer: "l1",
        outcome: "negative_hit",
      });
      throwNoResults();
    }
    if (isValidGeocodedLocation(memoryEntry)) {
      logGeocodeCacheEvent(logInfo, {
        cacheLayer: "l1",
        outcome: "hit",
      });
      return { lat: memoryEntry.lat, lng: memoryEntry.lng };
    }
  }
  logGeocodeCacheEvent(logInfo, {
    cacheLayer: "l1",
    outcome: "miss",
  });

  const sharedEntry = await readSharedCache(docId, nowMs);
  if (sharedEntry) {
    writeMemoryGeocodeCache(docId, sharedEntry);
    if (sharedEntry.status === "no_results") {
      logGeocodeCacheEvent(logInfo, {
        cacheLayer: "l2",
        outcome: "negative_hit",
      });
      throwNoResults();
    }
    if (isValidGeocodedLocation(sharedEntry)) {
      logGeocodeCacheEvent(logInfo, {
        cacheLayer: "l2",
        outcome: "hit",
      });
      return { lat: sharedEntry.lat, lng: sharedEntry.lng };
    }
  }
  logGeocodeCacheEvent(logInfo, {
    cacheLayer: "l2",
    outcome: "miss",
  });

  const geocodingResult = await geocode({
    apiKey: params.apiKey,
    address: params.address,
  });

  if (geocodingResult.status === "no_results") {
    const negativeEntry: GeocodeCacheEntry = {
      status: "no_results",
      expiresAtMs: nowMs + NEGATIVE_TTL_MS,
    };
    writeMemoryGeocodeCache(docId, negativeEntry);
    await writeSharedCache(docId, negativeEntry, nowMs);
    logGeocodeCacheEvent(logInfo, {
      cacheLayer: "api",
      outcome: "write",
    });
    throwNoResults();
  }

  const positiveEntry: GeocodeCacheEntry = {
    status: "ok",
    lat: geocodingResult.location.lat,
    lng: geocodingResult.location.lng,
    expiresAtMs: nowMs + POSITIVE_TTL_MS,
  };
  writeMemoryGeocodeCache(docId, positiveEntry);
  await writeSharedCache(docId, positiveEntry, nowMs);
  logGeocodeCacheEvent(logInfo, {
    cacheLayer: "api",
    outcome: "write",
  });
  return geocodingResult.location;
}

function isValidGeocodedLocation(
  entry: GeocodeCacheEntry,
): entry is GeocodeCacheEntry & { lat: number; lng: number } {
  return (
    entry.status === "ok" &&
    typeof entry.lat === "number" &&
    Number.isFinite(entry.lat) &&
    typeof entry.lng === "number" &&
    Number.isFinite(entry.lng)
  );
}

function throwNoResults(): never {
  throw new HttpsError("internal", "Geocoding API returned no results.");
}

function readMemoryGeocodeCache(
  docId: string,
  nowMs: number,
): GeocodeCacheEntry | null {
  const entry = inMemoryCache.get(docId);
  if (!entry) {
    return null;
  }
  if (entry.expiresAtMs <= nowMs) {
    inMemoryCache.delete(docId);
    return null;
  }
  return entry;
}

function writeMemoryGeocodeCache(
  docId: string,
  entry: GeocodeCacheEntry,
): void {
  inMemoryCache.set(docId, entry);
}

async function readSharedGeocodeCache(
  docId: string,
  nowMs: number,
): Promise<GeocodeCacheEntry | null> {
  const snapshot = await db.collection(CACHE_COLLECTION).doc(docId).get();
  if (!snapshot.exists) {
    return null;
  }
  const rawData = snapshot.data() as {
    expiresAt?: Timestamp | Date | number;
    lat?: unknown;
    lng?: unknown;
    status?: unknown;
  };
  const status = parseStatus(rawData.status);
  if (!status) {
    return null;
  }
  const expiresAtMs = parseExpiresAtMs(rawData.expiresAt);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= nowMs) {
    return null;
  }
  if (status === "no_results") {
    return {
      status,
      expiresAtMs,
    };
  }
  if (
    typeof rawData.lat !== "number" ||
    !Number.isFinite(rawData.lat) ||
    typeof rawData.lng !== "number" ||
    !Number.isFinite(rawData.lng)
  ) {
    return null;
  }
  return {
    status,
    lat: rawData.lat,
    lng: rawData.lng,
    expiresAtMs,
  };
}

async function writeSharedGeocodeCache(
  docId: string,
  entry: GeocodeCacheEntry,
  nowMs: number,
): Promise<void> {
  const payload: SharedCacheWriterPayload = {
    status: entry.status,
    version: CACHE_SCHEMA_VERSION,
    expiresAt: Timestamp.fromMillis(entry.expiresAtMs),
    updatedAt: Timestamp.fromMillis(nowMs),
  };
  if (entry.status === "ok" && isValidGeocodedLocation(entry)) {
    payload.lat = entry.lat;
    payload.lng = entry.lng;
  }
  await db.collection(CACHE_COLLECTION).doc(docId).set(payload);
}

function parseExpiresAtMs(value?: Timestamp | Date | number): number {
  if (value instanceof Timestamp) {
    return value.toMillis();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === "number") {
    return value;
  }
  return Number.NaN;
}

function parseStatus(value: unknown): GeocodeCacheStatus | null {
  if (value === "ok" || value === "no_results") {
    return value;
  }
  return null;
}

function logGeocodeCacheEvent(
  logInfo: (message: string, data: Record<string, unknown>) => void,
  event: {
    cacheLayer: "l1" | "l2" | "api";
    outcome: "hit" | "miss" | "negative_hit" | "write";
  },
): void {
  logInfo("Geocode cache lookup", {
    cacheKeyVersion: CACHE_KEY_VERSION,
    cacheLayer: event.cacheLayer,
    outcome: event.outcome,
  });
}
