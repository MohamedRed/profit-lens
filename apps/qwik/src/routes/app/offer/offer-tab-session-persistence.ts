import type { UseOfferTabSessionParams } from './use-offer-tab-session';
import { writeOfferTabSessionState } from './offer-tab-session';

export const persistOfferTabSessionSnapshot = (
  params: UseOfferTabSessionParams,
): void => {
  const uid = params.auth.user.value?.uid;
  if (!uid) {
    return;
  }

  writeOfferTabSessionState({
    uid,
    payout: params.payout.value,
    distance: params.distance.value,
    duration: params.duration.value,
    pickupName: params.pickupName.value,
    pickupAddress: params.pickupAddress.value,
    dropoffName: params.dropoffName.value,
    dropoffAddress: params.dropoffAddress.value,
    profile: params.profile.value,
    minProfitabilityEuro: params.minProfitabilityEuro.value,
    selectedVehicleId: params.selectedVehicleId.value,
    vehicles: params.vehicles.value,
    vehiclesLoading: params.vehiclesLoading.value,
    manualEntryRequested: params.manualEntryRequested.value,
    status: params.status.value,
    analysisRecord: params.analysisRecord.value,
    screenshotPreviewUrl: params.screenshotPreviewUrl.value,
  });
};
