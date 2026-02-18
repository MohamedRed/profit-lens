import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import type { OfferAnalysisRecord } from './offer-analysis-result';

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

export const readOfferTabSessionState = (uid: string): OfferTabSessionState | null => {
  if (!offerTabSessionState || offerTabSessionState.uid !== uid) {
    return null;
  }
  return {
    ...offerTabSessionState,
    profile: offerTabSessionState.profile ? { ...offerTabSessionState.profile } : null,
    vehicles: [...offerTabSessionState.vehicles],
    analysisRecord: cloneAnalysisRecord(offerTabSessionState.analysisRecord),
  };
};

export const writeOfferTabSessionState = (nextState: OfferTabSessionState): void => {
  offerTabSessionState = {
    ...nextState,
    profile: nextState.profile ? { ...nextState.profile } : null,
    vehicles: [...nextState.vehicles],
    analysisRecord: cloneAnalysisRecord(nextState.analysisRecord),
  };
};
