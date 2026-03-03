import { $, component$, useSignal } from '@builder.io/qwik';
import { useAuth } from '../../../lib/auth/auth-context';
import { getDeviceId } from '../../../lib/config/device-id';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import { resolveUserFacingErrorMessage } from '../../../lib/errors/user-facing-error';
import { saveUserProfile } from '../../../lib/features/profile/profile-service';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import { analyzeManualOfferAction, analyzeScreenshotOfferAction } from './offer-actions';
import { readRequiredCurrentLocation } from './offer-current-location';
import { parseOfferAnalysisRecord, type OfferAnalysisRecord } from './offer-analysis-result';
import { setOfferAnalysisErrorStatus, startOfferAnalysisProgress } from './offer-analysis-runtime';
import { primeHistoryAfterAnalysis, primeOfferDetailsNavigation } from './offer-analysis-navigation';
import { takeOfferScreenshotFile } from './offer-file-transfer-store';
import { OfferFlowContent } from './components/offer-flow-content';
import { ensureWithinOfferLimit } from './offer-flow-limits';
import { loadOffersService } from './offer-service-loader';
import { useOfferLocationPrefetch } from './use-offer-location-prefetch';
import { persistOfferTabSessionSnapshot } from './offer-tab-session-persistence';
import { useOfferTabSession } from './use-offer-tab-session';

export default component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
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
  const analysisRunId = useSignal(0);
  const screenshotPreviewUrl = useSignal<string | null>(null);
  useOfferLocationPrefetch();
  const offerTabSessionParams = {
    auth, payout, distance, duration, pickupName, pickupAddress, dropoffName, dropoffAddress,
    profile, minProfitabilityEuro, selectedVehicleId, vehicles, vehiclesLoading,
    manualEntryRequested, loading, status, analysisRecord, screenshotPreviewUrl,
  };
  useOfferTabSession(offerTabSessionParams);
  const saveProfitabilityTarget$ = $(async (rawValue: string) => {
    const userProfile = profile.value;
    const normalizedValue = rawValue.trim().replace(',', '.');
    const parsed = Number(normalizedValue);
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
      status.value = resolveUserFacingErrorMessage(i18n, error, 'profile');
    } finally {
      savingProfitTarget.value = false;
    }
  });
  const analyzeManual$ = $(async () => {
    if (loading.value) {
      return;
    }
    const user = auth.user.value;
    if (!user) {
      status.value = resolveUserFacingErrorMessage(i18n, new Error('Missing authenticated user.'), 'offer');
      return;
    }
    if (!selectedVehicleId.value) {
      status.value = t(i18n, 'vehicleSelectLabel', 'Select vehicle');
      return;
    }
    analysisRecord.value = null;
    loading.value = true;
    const { progressDriver, runId } = startOfferAnalysisProgress({
      analysisRunId,
      loading,
      status,
      onStatusUpdated: () => persistOfferTabSessionSnapshot(offerTabSessionParams),
    });
    persistOfferTabSessionSnapshot(offerTabSessionParams);
    try {
      const currentLocation = await readRequiredCurrentLocation();
      const payload = await analyzeManualOfferAction({
        deviceId: getDeviceId(),
        currentLocation,
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
      const parsed = parseOfferAnalysisRecord(payload);
      if (!parsed) {
        throw new Error('Missing analysis record in response.');
      }
      if (analysisRunId.value !== runId) {
        return;
      }
      analysisRecord.value = parsed;
      persistOfferTabSessionSnapshot(offerTabSessionParams);
      primeHistoryAfterAnalysis(user.uid, parsed);
      await progressDriver.waitForMinimumDuration();
      if (analysisRunId.value === runId) {
        status.value = 'Offer analyzed.';
        persistOfferTabSessionSnapshot(offerTabSessionParams);
      }
    } catch (error) {
      if (analysisRunId.value === runId) {
        setOfferAnalysisErrorStatus({
          analysisRecord,
          error,
          i18n,
          status,
        });
        persistOfferTabSessionSnapshot(offerTabSessionParams);
      }
    } finally {
      progressDriver.cancel();
      if (analysisRunId.value === runId) {
        loading.value = false;
        persistOfferTabSessionSnapshot(offerTabSessionParams);
      }
    }
  });
  const importScreenshotFile$ = $(async (fileToken: string) => {
    if (loading.value) {
      return;
    }
    if (!selectedVehicleId.value) {
      status.value = t(i18n, 'vehicleSelectLabel', 'Select vehicle');
      return;
    }
    analysisRecord.value = null;
    const file = takeOfferScreenshotFile(fileToken);
    if (!file) {
      status.value = t(
        i18n,
        'offerActionFailedMessage',
        'Unable to complete this action right now. Please try again.',
      );
      return;
    }
    const user = auth.user.value;
    if (!user) {
      status.value = resolveUserFacingErrorMessage(i18n, new Error('Missing authenticated user.'), 'offer');
      return;
    }
    if (screenshotPreviewUrl.value) {
      URL.revokeObjectURL(screenshotPreviewUrl.value);
    }
    screenshotPreviewUrl.value = URL.createObjectURL(file);
    loading.value = true;
    status.value = '';
    persistOfferTabSessionSnapshot(offerTabSessionParams);
    const withinLimit = await ensureWithinOfferLimit(user.uid);
    if (!withinLimit) {
      status.value = t(
        i18n,
        'offerLimitReachedMessage',
        'You have reached your monthly offer limit. Upgrade to continue.',
      );
      loading.value = false;
      persistOfferTabSessionSnapshot(offerTabSessionParams);
      return;
    }
    const { progressDriver, runId } = startOfferAnalysisProgress({
      analysisRunId,
      loading,
      status,
      onStatusUpdated: () => persistOfferTabSessionSnapshot(offerTabSessionParams),
    });
    persistOfferTabSessionSnapshot(offerTabSessionParams);
    try {
      const currentLocation = await readRequiredCurrentLocation();
      const payload = await analyzeScreenshotOfferAction({
        deviceId: getDeviceId(),
        currentLocation,
        file,
        vehicleId: selectedVehicleId.value,
        loadOffersService,
      });
      const parsed = parseOfferAnalysisRecord(payload);
      if (!parsed) {
        throw new Error('Missing analysis record in response.');
      }
      if (analysisRunId.value !== runId) {
        return;
      }
      analysisRecord.value = parsed;
      persistOfferTabSessionSnapshot(offerTabSessionParams);
      primeHistoryAfterAnalysis(user.uid, parsed);
      await progressDriver.waitForMinimumDuration();
      if (analysisRunId.value === runId) {
        status.value = 'Screenshot analyzed.';
        persistOfferTabSessionSnapshot(offerTabSessionParams);
      }
    } catch (error) {
      if (analysisRunId.value === runId) {
        setOfferAnalysisErrorStatus({
          analysisRecord,
          error,
          i18n,
          status,
        });
        persistOfferTabSessionSnapshot(offerTabSessionParams);
      }
    } finally {
      progressDriver.cancel();
      if (analysisRunId.value === runId) {
        loading.value = false;
        persistOfferTabSessionSnapshot(offerTabSessionParams);
      }
    }
  });
  const clearScreenshotPreview$ = $(() => {
    if (loading.value) {
      return;
    }
    if (screenshotPreviewUrl.value) {
      URL.revokeObjectURL(screenshotPreviewUrl.value);
    }
    screenshotPreviewUrl.value = null;
  });
  const viewDetails$ = $(async () => {
    const record = analysisRecord.value;
    if (!record?.id) {
      analysisRecord.value = null;
      status.value = t(
        i18n,
        'offerDetailsUnavailableMessage',
        'Unable to open details for this analysis. Please run the analysis again.',
      );
      return;
    }
    const scrollY = typeof window !== 'undefined' ? window.scrollY : null;
    primeOfferDetailsNavigation(record, scrollY);
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
      loading={loading}
      manualEntryRequested={manualEntryRequested}
      minProfitabilityEuro={minProfitabilityEuro}
      onAnalyzeManual$={analyzeManual$}
      onClearScreenshotPreview$={clearScreenshotPreview$}
      onImportScreenshotFile$={importScreenshotFile$}
      onSaveProfitabilityTarget$={saveProfitabilityTarget$}
      onViewDetails$={viewDetails$}
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
