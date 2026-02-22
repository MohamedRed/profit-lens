import { $, component$, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import { useAuth } from '../../../lib/auth/auth-context';
import { getDeviceId } from '../../../lib/config/device-id';
import { t, useI18n } from '../../../lib/i18n/i18n-context';
import { resolveUserFacingErrorMessage } from '../../../lib/errors/user-facing-error';
import { saveUserProfile } from '../../../lib/features/profile/profile-service';
import { saveExplicitBackTarget } from '../../../lib/navigation/explicit-back-target';
import { saveTabScrollY } from '../../../lib/navigation/tab-scroll-memory';
import type { OfferRecord } from '../../../lib/types/offer';
import type { UserProfile } from '../../../lib/types/profile';
import type { VehicleProfile } from '../../../lib/types/vehicle';
import {
  saveSelectedHistoryOfferId,
  upsertHistoryOfferCache,
} from '../history/history-offer-cache';
import {
  analyzeManualOfferAction,
  analyzeScreenshotOfferAction,
} from './offer-actions';
import {
  isOfferLocationError,
  readRequiredCurrentLocation,
  resolveOfferLocationErrorMessage,
} from './offer-current-location';
import {
  parseOfferAnalysisRecord,
  type OfferAnalysisRecord,
} from './offer-analysis-result';
import { OfferFlowContent } from './components/offer-flow-content';
import { ensureWithinOfferLimit } from './offer-flow-limits';
import { useOfferTabSession } from './use-offer-tab-session';

type OffersServiceModule = typeof import('../../../lib/features/offers/offers-service');
let offersServicePromise: Promise<OffersServiceModule> | null = null;

const loadOffersService = () => {
  if (!offersServicePromise) {
    offersServicePromise = import('../../../lib/features/offers/offers-service');
  }
  return offersServicePromise;
};

const toOfferRecord = (record: OfferAnalysisRecord): OfferRecord => {
  const parsedCreatedAt = new Date(record.createdAt);
  const createdAt = Number.isNaN(parsedCreatedAt.getTime()) ? null : parsedCreatedAt;
  const routeVerification = record.offer.routeVerification;

  return {
    id: record.id,
    source: record.source,
    createdAt,
    payoutEuro: record.offer.payoutEuro,
    distanceKm: routeVerification?.distanceKm ?? record.offer.distanceKm ?? 0,
    durationMinutes: record.offer.durationMinutes ?? undefined,
    routeVerifiedDistanceKm: routeVerification?.distanceKm,
    routeVerifiedDurationMinutes: routeVerification?.durationMinutes,
    pickupName: record.offer.pickupName ?? undefined,
    pickupAddress: record.offer.pickupAddress ?? undefined,
    dropoffName: record.offer.dropoffName ?? undefined,
    dropoffAddress: record.offer.dropoffAddress ?? undefined,
    netProfitEuro: record.breakdown.netProfit,
    totalCostsEuro: record.breakdown.totalCosts,
  };
};

export default component$(() => {
  const auth = useAuth();
  const navigate = useNavigate();
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
  const screenshotPreviewUrl = useSignal<string | null>(null);

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
    screenshotPreviewUrl,
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
      status.value = resolveUserFacingErrorMessage(i18n, error, 'profile');
    } finally {
      savingProfitTarget.value = false;
    }
  });

  const analyzeManual$ = $(async () => {
    if (!selectedVehicleId.value) {
      status.value = t(i18n, 'vehicleSelectLabel', 'Select vehicle');
      return;
    }

    loading.value = true;
    status.value = '';

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
      analysisRecord.value = parseOfferAnalysisRecord(payload);
      status.value = 'Offer analyzed.';
    } catch (error) {
      if (isOfferLocationError(error)) {
        status.value = resolveOfferLocationErrorMessage(i18n, error.code);
      } else {
        status.value = resolveUserFacingErrorMessage(i18n, error, 'offer');
      }
    } finally {
      loading.value = false;
    }
  });

  const importScreenshotFile$ = $(async (file: File) => {
    if (!selectedVehicleId.value) {
      status.value = t(i18n, 'vehicleSelectLabel', 'Select vehicle');
      return;
    }

    const user = auth.user.value;
    if (!user) {
      status.value = resolveUserFacingErrorMessage(i18n, new Error('Missing authenticated user.'), 'offer');
      return;
    }

    const withinLimit = await ensureWithinOfferLimit(user.uid);
    if (!withinLimit) {
      status.value = t(
        i18n,
        'offerLimitReachedMessage',
        'You have reached your monthly offer limit. Upgrade to continue.',
      );
      return;
    }

    if (screenshotPreviewUrl.value) {
      URL.revokeObjectURL(screenshotPreviewUrl.value);
    }
    screenshotPreviewUrl.value = URL.createObjectURL(file);

    loading.value = true;
    status.value = '';

    try {
      const currentLocation = await readRequiredCurrentLocation();
      const payload = await analyzeScreenshotOfferAction({
        deviceId: getDeviceId(),
        currentLocation,
        file,
        vehicleId: selectedVehicleId.value,
        loadOffersService,
      });
      analysisRecord.value = parseOfferAnalysisRecord(payload);
      status.value = 'Screenshot analyzed.';
    } catch (error) {
      if (isOfferLocationError(error)) {
        status.value = resolveOfferLocationErrorMessage(i18n, error.code);
      } else {
        status.value = resolveUserFacingErrorMessage(i18n, error, 'offer');
      }
    } finally {
      loading.value = false;
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
      return;
    }
    if (typeof window !== 'undefined') {
      saveTabScrollY('app/offer', window.scrollY);
    }
    saveSelectedHistoryOfferId(record.id);
    upsertHistoryOfferCache(toOfferRecord(record));
    saveExplicitBackTarget('history/details', '/next/app/offer');
    const search = new URLSearchParams({
      offerId: record.id,
      backTo: '/next/app/offer',
    });
    await navigate(`/next/app/history/details/?${search.toString()}`);
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
