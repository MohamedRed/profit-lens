import { beforeEach, describe, expect, it } from 'vitest';
import {
  readOfferTabSessionState,
  writeOfferTabSessionState,
  type OfferTabSessionState,
} from './offer-tab-session';

const OFFER_TAB_SESSION_STORAGE_KEY = 'profit-lens.offer-tab-session';

interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  clear: () => void;
}

interface WindowLike {
  sessionStorage: StorageLike;
}

const createSessionStorage = (): StorageLike => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    clear: () => {
      values.clear();
    },
  };
};

const getWindow = (): WindowLike => {
  return (globalThis as { window?: WindowLike }).window as WindowLike;
};

const buildState = (uid: string): OfferTabSessionState => ({
  uid,
  payout: '10.50',
  distance: '3.2',
  duration: '14',
  pickupName: 'A',
  pickupAddress: 'A street',
  dropoffName: 'B',
  dropoffAddress: 'B street',
  profile: {
    uid,
    email: 'test@example.com',
    countryCode: 'FR',
    currencyCode: 'EUR',
    activity: 'deliveryServices',
    socialContributionRate: 0.212,
    incomeTaxRate: 0.017,
    useLiberatoryTax: true,
    fixedCostAllocation: 'perDelivery',
    monthlyFixedCosts: 0,
    monthlyWorkingHours: 160,
    monthlyDistanceKm: 3000,
    monthlyDeliveries: 120,
    minProfitabilityEuro: 2,
    defaultVehicleId: 'vehicle-1',
    useFranceDefaults: true,
    preferredLocale: 'fr',
  },
  minProfitabilityEuro: 2,
  selectedVehicleId: 'vehicle-1',
  vehicles: [
    {
      id: 'vehicle-1',
      name: 'Renault 4',
      type: 'car',
      energyType: 'fuel',
      fuelType: 'e10',
      energyConsumptionPer100Km: 6,
      energyPricePerUnit: 1.9,
      maintenancePerKm: 0.05,
      depreciationPerKm: 0.1,
    },
  ],
  vehiclesLoading: false,
  manualEntryRequested: false,
  status: 'Offer analyzed.',
  analysisRecord: {
    id: 'offer-1',
    source: 'manual',
    createdAt: '2026-03-03T00:00:00.000Z',
    offer: {
      payoutEuro: 10.5,
      routeVerification: {
        distanceKm: 4.1,
        durationMinutes: 12,
      },
    },
    breakdown: {
      totalCosts: 2.2,
      netProfit: 8.3,
    },
  },
  screenshotPreviewUrl: 'data:image/jpeg;base64,preview',
});

describe('offer-tab-session', () => {
  beforeEach(() => {
    (globalThis as { window?: WindowLike }).window = {
      sessionStorage: createSessionStorage(),
    };
    getWindow().sessionStorage.clear();
  });

  it('reads back cloned state without mutating stored values', () => {
    const state = buildState('uid-clone');
    writeOfferTabSessionState(state);

    const firstRead = readOfferTabSessionState('uid-clone');
    expect(firstRead).not.toBeNull();
    expect(firstRead?.analysisRecord?.id).toBe('offer-1');

    if (!firstRead || !firstRead.profile || !firstRead.analysisRecord?.offer.routeVerification) {
      throw new Error('Expected a populated session state.');
    }

    firstRead.profile.defaultVehicleId = 'vehicle-x';
    firstRead.vehicles[0].name = 'Changed';
    firstRead.analysisRecord.offer.routeVerification.distanceKm = 999;

    const secondRead = readOfferTabSessionState('uid-clone');
    expect(secondRead?.profile?.defaultVehicleId).toBe('vehicle-1');
    expect(secondRead?.vehicles[0]?.name).toBe('Renault 4');
    expect(secondRead?.analysisRecord?.offer.routeVerification?.distanceKm).toBe(4.1);
  });

  it('falls back to sessionStorage when in-memory state is for another uid', () => {
    writeOfferTabSessionState(buildState('uid-memory'));
    getWindow().sessionStorage.setItem(
      OFFER_TAB_SESSION_STORAGE_KEY,
      JSON.stringify(buildState('uid-storage')),
    );

    const readFromStorage = readOfferTabSessionState('uid-storage');
    expect(readFromStorage?.uid).toBe('uid-storage');
    expect(readFromStorage?.analysisRecord?.id).toBe('offer-1');
  });

  it('returns null when no matching uid is available', () => {
    getWindow().sessionStorage.setItem(
      OFFER_TAB_SESSION_STORAGE_KEY,
      JSON.stringify(buildState('uid-a')),
    );

    expect(readOfferTabSessionState('uid-b')).toBeNull();
  });

  it('removes legacy blob preview urls loaded from storage', () => {
    const state = buildState('uid-legacy');
    state.screenshotPreviewUrl = 'blob:legacy-preview';
    getWindow().sessionStorage.setItem(
      OFFER_TAB_SESSION_STORAGE_KEY,
      JSON.stringify(state),
    );

    const session = readOfferTabSessionState('uid-legacy');
    expect(session?.screenshotPreviewUrl).toBeNull();
  });
});
