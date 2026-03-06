import { $, component$, useSignal } from '@builder.io/qwik';
import { useAuth } from '../../../../lib/auth/auth-context';
import { getDeviceId } from '../../../../lib/config/device-id';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import {
  createOfferScreenshotModalUrl,
  revokeOfferScreenshotModalUrl,
} from '../../../../lib/features/offers/offer-screenshot-modal-url';
import { createOfferScreenshotPreviewDataUrl } from '../../../../lib/features/offers/offer-screenshot-preview';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type { UserProfile } from '../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import { analyzeManualOfferAction, analyzeScreenshotOfferAction } from '../offer-actions';
import { parseOfferAnalysisRecord, type OfferAnalysisRecord } from '../offer-analysis-result';
import { primeHistoryAfterAnalysis } from '../offer-analysis-navigation';
import { readRequiredCurrentLocation } from '../offer-current-location';
import { takeOfferScreenshotFile } from '../offer-file-transfer-store';
import { ensureWithinOfferLimit } from '../offer-flow-limits';
import { setOfferAnalysisErrorStatus, startOfferAnalysisProgress } from '../offer-analysis-runtime';
import { loadOffersService } from '../offer-service-loader';
import {
  clearScreenshotPreviewAction,
  dismissStatusAction,
  enableLocationAction,
  saveProfitabilityTargetAction,
  viewDetailsAction,
} from '../offer-ui-actions';
import { persistOfferTabSessionSnapshot } from '../offer-tab-session-persistence';
import { useOfferLocationPrefetch } from '../use-offer-location-prefetch';
import { useOfferScreenshotModalCleanup } from '../use-offer-screenshot-modal-cleanup';
import { useOfferTabSession } from '../use-offer-tab-session';
import { OfferFlowContent } from './offer-flow-content';

export const SingleOfferFlow = component$(() => {
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
  const screenshotModalUrl = useSignal<string | null>(null);

  useOfferLocationPrefetch();
  const offerTabSessionParams = {
    auth, payout, distance, duration, pickupName, pickupAddress, dropoffName, dropoffAddress,
    profile, minProfitabilityEuro, selectedVehicleId, vehicles, vehiclesLoading,
    manualEntryRequested, loading, status, analysisRecord, screenshotPreviewUrl,
  };
  useOfferTabSession(offerTabSessionParams);
  useOfferScreenshotModalCleanup(screenshotModalUrl);

  const saveProfitabilityTarget$ = $(async (rawValue: string) => {
    await saveProfitabilityTargetAction({
      profile,
      minProfitabilityEuro,
      savingProfitTarget,
      i18n,
      status,
    }, rawValue);
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
        setOfferAnalysisErrorStatus({ analysisRecord, error, i18n, status });
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
      status.value = t(i18n, 'offerActionFailedMessage', 'Unable to complete this action right now. Please try again.');
      return;
    }
    const user = auth.user.value;
    if (!user) {
      status.value = resolveUserFacingErrorMessage(i18n, new Error('Missing authenticated user.'), 'offer');
      return;
    }
    const nextModalUrl = createOfferScreenshotModalUrl(file);
    try {
      const nextPreviewUrl = await createOfferScreenshotPreviewDataUrl(file);
      revokeOfferScreenshotModalUrl(screenshotModalUrl.value);
      screenshotModalUrl.value = nextModalUrl;
      screenshotPreviewUrl.value = nextPreviewUrl;
    } catch (error) {
      revokeOfferScreenshotModalUrl(nextModalUrl);
      throw error;
    }
    loading.value = true;
    status.value = '';
    persistOfferTabSessionSnapshot(offerTabSessionParams);
    const withinLimit = await ensureWithinOfferLimit(user.uid);
    if (!withinLimit) {
      status.value = t(i18n, 'offerLimitReachedMessage', 'You have reached your monthly offer limit. Upgrade to continue.');
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
        setOfferAnalysisErrorStatus({ analysisRecord, error, i18n, status });
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
    clearScreenshotPreviewAction({ loading, screenshotModalUrl, screenshotPreviewUrl });
  });
  const enableLocation$ = $(async () => {
    await enableLocationAction({
      i18n,
      status,
      persistState: () => persistOfferTabSessionSnapshot(offerTabSessionParams),
    }, loading);
  });
  const dismissStatus$ = $(() => {
    dismissStatusAction({
      status,
      persistState: () => persistOfferTabSessionSnapshot(offerTabSessionParams),
    });
  });
  const viewDetails$ = $(async () => {
    viewDetailsAction({ analysisRecord, i18n, status });
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
      onDismissStatus$={dismissStatus$}
      onEnableLocation$={enableLocation$}
      onImportScreenshotFile$={importScreenshotFile$}
      onSaveProfitabilityTarget$={saveProfitabilityTarget$}
      onViewDetails$={viewDetails$}
      payout={payout}
      pickupAddress={pickupAddress}
      pickupName={pickupName}
      savingProfitTarget={savingProfitTarget}
      screenshotPreviewUrl={screenshotPreviewUrl}
      screenshotModalUrl={screenshotModalUrl}
      selectedVehicleId={selectedVehicleId}
      status={status}
      vehicles={vehicles}
      vehiclesLoading={vehiclesLoading}
    />
  );
});
