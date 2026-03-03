import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import type { OfferAnalysisRecord } from './offer-analysis-result';

const OFFER_TAB_SESSION_STORAGE_KEY = 'profit-lens.offer-tab-session';

export interface OfferTabSessionState {
  uid: string;
  payout: string;
  distance: string;
  duration: string;
  pickupName: string;
  pickupAddress: string;
  dropoffName: string;
  dropoffAddress: string;
  profile: UserProfile | null;
  minProfitabilityEuro: number;
  selectedVehicleId: string;
  vehicles: VehicleProfile[];
  vehiclesLoading: boolean;
  manualEntryRequested: boolean;
  status: string;
  analysisRecord: OfferAnalysisRecord | null;
  screenshotPreviewUrl: string | null;
}

let offerTabSessionState: OfferTabSessionState | null = null;

const cloneAnalysisRecord = (record: OfferAnalysisRecord | null): OfferAnalysisRecord | null => {
  if (!record) {
    return null;
  }
  return {
    ...record,
    offer: {
      ...record.offer,
      routeVerification: record.offer.routeVerification ? { ...record.offer.routeVerification } : null,
    },
    breakdown: { ...record.breakdown },
  };
};

const cloneOfferTabSessionState = (state: OfferTabSessionState): OfferTabSessionState => {
  return {
    ...state,
    profile: state.profile ? { ...state.profile } : null,
    vehicles: state.vehicles.map((vehicle) => ({ ...vehicle })),
    analysisRecord: cloneAnalysisRecord(state.analysisRecord),
  };
};

const readOfferTabSessionStateFromStorage = (): OfferTabSessionState | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(OFFER_TAB_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as OfferTabSessionState;
  } catch {
    return null;
  }
};

const writeOfferTabSessionStateToStorage = (state: OfferTabSessionState): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(OFFER_TAB_SESSION_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors (private mode, quota) and keep in-memory fallback.
  }
};

export const readOfferTabSessionState = (uid: string): OfferTabSessionState | null => {
  if (offerTabSessionState?.uid === uid) {
    return cloneOfferTabSessionState(offerTabSessionState);
  }

  const storageState = readOfferTabSessionStateFromStorage();
  if (!storageState || storageState.uid !== uid) {
    return null;
  }

  offerTabSessionState = cloneOfferTabSessionState(storageState);
  return cloneOfferTabSessionState(storageState);
};

export const writeOfferTabSessionState = (nextState: OfferTabSessionState): void => {
  const cloned = cloneOfferTabSessionState(nextState);
  offerTabSessionState = cloned;
  writeOfferTabSessionStateToStorage(cloned);
};
