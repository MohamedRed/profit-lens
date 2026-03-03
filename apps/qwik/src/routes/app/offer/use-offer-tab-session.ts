import { useVisibleTask$, type Signal } from '@builder.io/qwik';
import type { AuthStore } from '../../../lib/auth/auth-context';
import { watchUserProfile } from '../../../lib/features/profile/profile-service';
import { watchVehicles } from '../../../lib/features/vehicles/vehicles-service';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import type { OfferAnalysisRecord } from './offer-analysis-result';
import { parseOfferAnalysisProgressStep } from './offer-analysis-progress';
import { readOfferTabSessionState, writeOfferTabSessionState } from './offer-tab-session';

interface UseOfferTabSessionParams {
  auth: AuthStore;
  payout: Signal<string>;
  distance: Signal<string>;
  duration: Signal<string>;
  pickupName: Signal<string>;
  pickupAddress: Signal<string>;
  dropoffName: Signal<string>;
  dropoffAddress: Signal<string>;
  profile: Signal<UserProfile | null>;
  minProfitabilityEuro: Signal<number>;
  selectedVehicleId: Signal<string>;
  vehicles: Signal<VehicleProfile[]>;
  vehiclesLoading: Signal<boolean>;
  manualEntryRequested: Signal<boolean>;
  loading: Signal<boolean>;
  status: Signal<string>;
  analysisRecord: Signal<OfferAnalysisRecord | null>;
  screenshotPreviewUrl: Signal<string | null>;
}

const resolveSelectedVehicleId = (
  current: string,
  vehicles: VehicleProfile[],
  defaultVehicleId: string | null | undefined,
): string => {
  if (current && vehicles.some((vehicle) => vehicle.id === current)) {
    return current;
  }
  if (defaultVehicleId && vehicles.some((vehicle) => vehicle.id === defaultVehicleId)) {
    return defaultVehicleId;
  }
  return vehicles[0]?.id ?? '';
};

export const useOfferTabSession = (params: UseOfferTabSessionParams): void => {
  const {
    auth,
    payout,
    distance,
    duration,
    pickupName,
    pickupAddress,
    dropoffName,
    dropoffAddress,
    profile,
    minProfitabilityEuro,
    selectedVehicleId,
    vehicles,
    vehiclesLoading,
    manualEntryRequested,
    loading,
    status,
    analysisRecord,
    screenshotPreviewUrl,
  } = params;

  useVisibleTask$(({ track, cleanup }) => {
    const userUid = track(() => auth.user.value?.uid);
    const user = auth.user.value;
    if (!user || !userUid) {
      profile.value = null;
      vehicles.value = [];
      selectedVehicleId.value = '';
      vehiclesLoading.value = false;
      loading.value = false;
      status.value = '';
      analysisRecord.value = null;
      screenshotPreviewUrl.value = null;
      return;
    }

    const session = readOfferTabSessionState(userUid);
    if (session) {
      payout.value = session.payout;
      distance.value = session.distance;
      duration.value = session.duration;
      pickupName.value = session.pickupName;
      pickupAddress.value = session.pickupAddress;
      dropoffName.value = session.dropoffName;
      dropoffAddress.value = session.dropoffAddress;
      profile.value = session.profile;
      minProfitabilityEuro.value = session.minProfitabilityEuro;
      selectedVehicleId.value = session.selectedVehicleId;
      vehicles.value = session.vehicles;
      vehiclesLoading.value = session.vehiclesLoading;
      manualEntryRequested.value = session.manualEntryRequested;
      status.value = parseOfferAnalysisProgressStep(session.status)
        ? ''
        : session.status;
      analysisRecord.value = session.analysisRecord;
      screenshotPreviewUrl.value = session.screenshotPreviewUrl;
      loading.value = false;
    } else {
      vehiclesLoading.value = true;
    }

    const unsubscribeVehicles = watchVehicles(userUid, (items) => {
      vehicles.value = items;
      vehiclesLoading.value = false;
      selectedVehicleId.value = resolveSelectedVehicleId(
        selectedVehicleId.value,
        items,
        profile.value?.defaultVehicleId,
      );
    });

    const unsubscribeProfile = watchUserProfile(userUid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
      minProfitabilityEuro.value = nextProfile.minProfitabilityEuro;
      selectedVehicleId.value = resolveSelectedVehicleId(
        selectedVehicleId.value,
        vehicles.value,
        nextProfile.defaultVehicleId,
      );
    });

    cleanup(() => {
      unsubscribeVehicles();
      unsubscribeProfile();
    });
  });

  useVisibleTask$(({ track }) => {
    const uid = track(() => auth.user.value?.uid);
    const currentPayout = track(() => payout.value);
    const currentDistance = track(() => distance.value);
    const currentDuration = track(() => duration.value);
    const currentPickupName = track(() => pickupName.value);
    const currentPickupAddress = track(() => pickupAddress.value);
    const currentDropoffName = track(() => dropoffName.value);
    const currentDropoffAddress = track(() => dropoffAddress.value);
    const currentProfile = track(() => profile.value);
    const currentMinProfitability = track(() => minProfitabilityEuro.value);
    const currentVehicleId = track(() => selectedVehicleId.value);
    const currentVehicles = track(() => vehicles.value);
    const currentVehiclesLoading = track(() => vehiclesLoading.value);
    const currentManualEntryRequested = track(() => manualEntryRequested.value);
    const currentStatus = track(() => status.value);
    const currentAnalysisRecord = track(() => analysisRecord.value);
    const currentScreenshotPreviewUrl = track(() => screenshotPreviewUrl.value);

    if (!uid) {
      return;
    }

    writeOfferTabSessionState({
      uid,
      payout: currentPayout,
      distance: currentDistance,
      duration: currentDuration,
      pickupName: currentPickupName,
      pickupAddress: currentPickupAddress,
      dropoffName: currentDropoffName,
      dropoffAddress: currentDropoffAddress,
      profile: currentProfile,
      minProfitabilityEuro: currentMinProfitability,
      selectedVehicleId: currentVehicleId,
      vehicles: currentVehicles,
      vehiclesLoading: currentVehiclesLoading,
      manualEntryRequested: currentManualEntryRequested,
      status: currentStatus,
      analysisRecord: currentAnalysisRecord,
      screenshotPreviewUrl: currentScreenshotPreviewUrl,
    });
  });
};
