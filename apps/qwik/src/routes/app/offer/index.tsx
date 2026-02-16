import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../lib/auth/auth-context';
import { getDeviceId } from '../../../lib/config/device-id';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import { saveUserProfile } from '../../../lib/features/profile/profile-service';
import {
  analyzeManualOfferAction,
  analyzeScreenshotOfferAction,
} from './offer-actions';
import {
  parseOfferAnalysisRecord,
  type OfferAnalysisRecord,
} from './offer-analysis-result';
import { OfferFlowContent } from './components/offer-flow-content';
import { useOfferTabSession } from './use-offer-tab-session';

type OffersServiceModule = typeof import('../../../lib/features/offers/offers-service');
let offersServicePromise: Promise<OffersServiceModule> | null = null;

const loadOffersService = () => {
  if (!offersServicePromise) {
    offersServicePromise = import('../../../lib/features/offers/offers-service');
  }
  return offersServicePromise;
};

export default component$(() => {
  const auth = useAuth();

  const payout = useSignal('');
  const distance = useSignal('');
  const duration = useSignal('');
  const pickupName = useSignal('');
  const pickupAddress = useSignal('');
  const dropoffName = useSignal('');
  const dropoffAddress = useSignal('');

  const profile = useSignal<UserProfile | null>(null);
  const minProfitabilityEuro = useSignal(2);
  const savingProfitTarget = useSignal(false);

  const selectedVehicleId = useSignal('');
  const vehicles = useSignal<VehicleProfile[]>([]);
  const vehiclesLoading = useSignal(true);

  const manualEntryRequested = useSignal(false);
  const loading = useSignal(false);
  const status = useSignal('');
  const analysisRecord = useSignal<OfferAnalysisRecord | null>(null);
  const screenshotPreviewUrl = useSignal<string | null>(null);
  const fileInputRef = useSignal<HTMLInputElement>();

  useOfferTabSession({
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
  });

  useVisibleTask$(({ track, cleanup }) => {
    const preview = track(() => screenshotPreviewUrl.value);
    cleanup(() => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    });
  });

  const saveProfitabilityTarget$ = $(async (rawValue: string) => {
    const userProfile = profile.value;
    const parsed = Number(rawValue);
    if (!userProfile || !Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    if (parsed === userProfile.minProfitabilityEuro) {
      return;
    }

    const nextProfile = { ...userProfile, minProfitabilityEuro: parsed };
    minProfitabilityEuro.value = parsed;
    profile.value = nextProfile;
    savingProfitTarget.value = true;

    try {
      await saveUserProfile(nextProfile);
    } catch (error) {
      status.value = error instanceof Error ? error.message : String(error);
    } finally {
      savingProfitTarget.value = false;
    }
  });

  const analyzeManual$ = $(async () => {
    if (!selectedVehicleId.value) {
      status.value = 'Select vehicle';
      return;
    }

    loading.value = true;
    status.value = '';

    try {
      const payload = await analyzeManualOfferAction({
        deviceId: getDeviceId(),
        payout: payout.value,
        distance: distance.value,
        duration: duration.value,
        pickupName: pickupName.value,
        pickupAddress: pickupAddress.value,
        dropoffName: dropoffName.value,
        dropoffAddress: dropoffAddress.value,
        vehicleId: selectedVehicleId.value,
        loadOffersService,
      });
      analysisRecord.value = parseOfferAnalysisRecord(payload);
      status.value = 'Offer analyzed.';
    } catch (error) {
      status.value = error instanceof Error ? error.message : String(error);
    } finally {
      loading.value = false;
    }
  });

  const importScreenshot$ = $(async (input: HTMLInputElement) => {
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    if (!selectedVehicleId.value) {
      status.value = 'Select vehicle';
      input.value = '';
      return;
    }

    if (screenshotPreviewUrl.value) {
      URL.revokeObjectURL(screenshotPreviewUrl.value);
    }
    screenshotPreviewUrl.value = URL.createObjectURL(file);

    loading.value = true;
    status.value = '';

    try {
      const payload = await analyzeScreenshotOfferAction({
        deviceId: getDeviceId(),
        file,
        vehicleId: selectedVehicleId.value,
        loadOffersService,
      });
      analysisRecord.value = parseOfferAnalysisRecord(payload);
      status.value = 'Screenshot analyzed.';
    } catch (error) {
      status.value = error instanceof Error ? error.message : String(error);
    } finally {
      loading.value = false;
      input.value = '';
    }
  });

  const clearScreenshotPreview$ = $(() => {
    if (screenshotPreviewUrl.value) {
      URL.revokeObjectURL(screenshotPreviewUrl.value);
    }
    screenshotPreviewUrl.value = null;
  });

  const user = auth.user.value;
  if (!user) {
    return null;
  }

  return (
    <OfferFlowContent
      userId={user.uid}
      analysisRecord={analysisRecord}
      distance={distance}
      dropoffAddress={dropoffAddress}
      dropoffName={dropoffName}
      duration={duration}
      fileInputRef={fileInputRef}
      loading={loading}
      manualEntryRequested={manualEntryRequested}
      minProfitabilityEuro={minProfitabilityEuro}
      onAnalyzeManual$={analyzeManual$}
      onClearScreenshotPreview$={clearScreenshotPreview$}
      onImportScreenshot$={importScreenshot$}
      onSaveProfitabilityTarget$={saveProfitabilityTarget$}
      payout={payout}
      pickupAddress={pickupAddress}
      pickupName={pickupName}
      savingProfitTarget={savingProfitTarget}
      screenshotPreviewUrl={screenshotPreviewUrl}
      selectedVehicleId={selectedVehicleId}
      status={status}
      vehicles={vehicles}
      vehiclesLoading={vehiclesLoading}
    />
  );
});
