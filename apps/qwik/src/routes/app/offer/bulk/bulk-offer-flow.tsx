import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../../lib/auth/auth-context';
import { getDeviceId } from '../../../../lib/config/device-id';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import { commitBulkOffersImport } from '../../../../lib/features/offers/bulk-offers-service';
import { watchUserProfile } from '../../../../lib/features/profile/profile-service';
import { watchVehicles } from '../../../../lib/features/vehicles/vehicles-service';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type {
  BulkInvalidRow,
  BulkParsedRow,
  CommitBulkOffersImportResponse,
  ScreenshotRef,
} from '../../../../lib/types/bulk-offers';
import type { UserProfile } from '../../../../lib/types/profile';
import type { VehicleProfile } from '../../../../lib/types/vehicle';
import { OfferSetupModalStack } from '../components/offer-setup-modal-stack';
import { saveProfitabilityTargetAction } from '../offer-ui-actions';
import { type OfferAnalysisProgressStep } from '../offer-analysis-progress';
import { BulkAnalysisProgress } from './components/bulk-analysis-progress';
import { BulkImportHero } from './components/bulk-import-hero';
import { BulkInvalidRowsPanel } from './components/bulk-invalid-rows-panel';
import { BulkSavedResults } from './components/bulk-saved-results';
import { BulkScreenshotPreviewList } from './components/bulk-screenshot-preview-list';
import { BulkStatusBanner } from './components/bulk-status-banner';
import { BulkSummaryKpis } from './components/bulk-summary-kpis';
import {
  resolveLocalTodayIso,
  revokeBulkScreenshotPreviews,
  type BulkScreenshotPreview,
} from './bulk-helpers';
import { runBulkParseImport } from './bulk-parse-import';
const resolveTimeZone = (): string | null => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone && zone.trim().length > 0 ? zone : null;
  } catch {
    return null;
  }
};

export const BulkOfferFlow = component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const serviceDateIso = useSignal(resolveLocalTodayIso());
  const parseInFlight = useSignal(false);
  const parseRunId = useSignal(0);
  const activeParseStep = useSignal<OfferAnalysisProgressStep | null>(null);
  const parseBatchIndex = useSignal(0);
  const parseBatchTotal = useSignal(0);
  const saveInFlight = useSignal(false);
  const profile = useSignal<UserProfile | null>(null);
  const minProfitabilityEuro = useSignal(2);
  const vehicles = useSignal<VehicleProfile[]>([]);
  const vehiclesLoading = useSignal(true);
  const selectedVehicleId = useSignal('');
  const savingProfitTarget = useSignal(false);
  const settingsSheetOpen = useSignal(false);
  const importFileInputRef = useSignal<HTMLInputElement>();
  const parsedRows = useSignal<BulkParsedRow[]>([]);
  const invalidRows = useSignal<BulkInvalidRow[]>([]);
  const screenshotRefs = useSignal<ScreenshotRef[]>([]);
  const screenshotPreviews = useSignal<BulkScreenshotPreview[]>([]);
  const status = useSignal('');
  const statusTone = useSignal<'default' | 'error' | 'success'>('default');
  const commitResult = useSignal<CommitBulkOffersImportResponse | null>(null);
  useVisibleTask$(({ track, cleanup }) => {
    const isReady = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    if (!isReady || !user) {
      profile.value = null;
      vehicles.value = [];
      vehiclesLoading.value = true;
      selectedVehicleId.value = '';
      return;
    }

    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
      minProfitabilityEuro.value = nextProfile.minProfitabilityEuro;
    });
    const unsubscribeVehicles = watchVehicles(user.uid, (nextVehicles) => {
      vehicles.value = nextVehicles;
      vehiclesLoading.value = false;
    });

    cleanup(() => {
      unsubscribeProfile();
      unsubscribeVehicles();
    });
  });

  useVisibleTask$(({ track }) => {
    track(() => vehicles.value);
    track(() => profile.value?.defaultVehicleId);
    const isSelectedVehicleValid = vehicles.value.some((vehicle) => vehicle.id === selectedVehicleId.value);
    if (!isSelectedVehicleValid) {
      const defaultVehicleId = profile.value?.defaultVehicleId ?? '';
      selectedVehicleId.value = vehicles.value.some((vehicle) => vehicle.id === defaultVehicleId)
        ? defaultVehicleId
        : '';
    }
  });

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      revokeBulkScreenshotPreviews(screenshotPreviews.value);
    });
  });
  const saveProfitabilityTarget$ = $(async (rawValue: string) => {
    await saveProfitabilityTargetAction({
      profile,
      minProfitabilityEuro,
      savingProfitTarget,
      i18n,
      status,
    }, rawValue);
  });

  const onVehicleChange$ = $((vehicleId: string) => {
    selectedVehicleId.value = vehicleId;
    status.value = '';
    statusTone.value = 'default';
    commitResult.value = null;
  });

  const onImportFiles$ = $(async (files: File[]) => {
    const user = auth.user.value;
    if (!user) {
      return;
    }
    if (parseInFlight.value || saveInFlight.value) {
      return;
    }
    if (!selectedVehicleId.value) {
      status.value = t(i18n, 'vehicleSelectLabel', 'Select vehicle');
      statusTone.value = 'error';
      return;
    }
    if (files.length === 0) {
      status.value = t(i18n, 'bulkSelectScreenshotButton', 'Choose screenshot');
      statusTone.value = 'error';
      return;
    }
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      status.value = t(i18n, 'bulkSelectScreenshotButton', 'Choose screenshot');
      statusTone.value = 'error';
      return;
    }
    const timezone = resolveTimeZone();
    if (!timezone) {
      status.value = t(i18n, 'bulkTimezoneMissing', 'Timezone is required on this device.');
      statusTone.value = 'error';
      return;
    }

    if (screenshotPreviews.value.length > 0) {
      revokeBulkScreenshotPreviews(screenshotPreviews.value);
    }
    parsedRows.value = [];
    invalidRows.value = [];
    screenshotRefs.value = [];
    screenshotPreviews.value = [];
    status.value = '';
    statusTone.value = 'default';
    commitResult.value = null;

    const { failedFileCount, latestErrorMessage } = await runBulkParseImport({
      deviceId: getDeviceId(),
      files: imageFiles,
      timezone,
      serviceDateIso: serviceDateIso.value,
      vehicleId: selectedVehicleId.value,
      i18n,
      parseRunId,
      parseInFlight,
      activeParseStep,
      parseBatchIndex,
      parseBatchTotal,
      parsedRows,
      invalidRows,
      screenshotRefs,
      screenshotPreviews,
    });

    if (parsedRows.value.length === 0) {
      status.value = latestErrorMessage ?? t(i18n, 'bulkNoRowsToSave', 'No valid rows to save.');
      statusTone.value = 'error';
      return;
    }

    saveInFlight.value = true;
    status.value = t(i18n, 'bulkAutoSaveInFlight', 'Saving analyzed deliveries...');
    statusTone.value = 'default';
    try {
      const response = await commitBulkOffersImport({
        deviceId: getDeviceId(),
        timezone,
        serviceDateIso: serviceDateIso.value,
        vehicleId: selectedVehicleId.value,
        screenshotRefs: screenshotRefs.value,
        rows: parsedRows.value,
      });
      commitResult.value = response;
      parsedRows.value = [];
      screenshotRefs.value = [];
      status.value = failedFileCount > 0
        ? t(
            i18n,
            'bulkAutoSavePartialSuccess',
            '{saved} deliveries saved automatically. {failed} screenshot(s) failed to parse.',
          )
            .replace('{saved}', String(response.savedCount))
            .replace('{failed}', String(failedFileCount))
        : t(i18n, 'bulkAutoSaveSuccess', '{saved} deliveries saved automatically.')
            .replace('{saved}', String(response.savedCount));
      statusTone.value = 'success';
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, 'offer');
      statusTone.value = 'error';
    } finally {
      saveInFlight.value = false;
    }
  });

  const onChooseImport$ = $(() => {
    importFileInputRef.value?.click();
  });

  const onImportInputChange$ = $(async (_: Event, input: HTMLInputElement) => {
    const nextFiles = input.files ? Array.from(input.files) : [];
    await onImportFiles$(nextFiles);
    input.value = '';
  });
  const user = auth.user.value;
  if (!user) {
    return null;
  }

  const hasVehicles = vehicles.value.length > 0;
  const busy = parseInFlight.value || saveInFlight.value;
  const importDisabled = busy || !hasVehicles;
  const showEmptyState = !vehiclesLoading.value && !hasVehicles;

  return (
    <div class="ui-stack ui-offer-flow">
      {showEmptyState ? (
        <div class="ui-offer-no-vehicle-state">
          <p class="ui-offer-empty-copy">
            {t(i18n, 'noVehiclesMessage', 'Add a vehicle to start analyzing offers.')}
          </p>
        </div>
      ) : (
        <>
          <BulkImportHero
            busy={busy}
            disabled={importDisabled}
            importFileInputRef={importFileInputRef}
            onChooseImport$={onChooseImport$}
            onImportInputChange$={onImportInputChange$}
            onOpenSettings$={() => {
              settingsSheetOpen.value = true;
            }}
          />

          <BulkScreenshotPreviewList previews={screenshotPreviews.value} />
          <BulkAnalysisProgress
            activeStep={activeParseStep.value}
            currentIndex={parseBatchIndex.value}
            totalCount={parseBatchTotal.value}
          />
          <BulkStatusBanner message={status.value} tone={statusTone.value} />
          <BulkInvalidRowsPanel rows={invalidRows.value} />
          <BulkSavedResults
            minProfitabilityEuro={minProfitabilityEuro.value}
            records={commitResult.value?.records ?? []}
          />
          <BulkSummaryKpis locale={i18n.locale.value} committed={commitResult.value} />

          <OfferSetupModalStack
            isSettingsOpen={settingsSheetOpen}
            minProfitabilityEuro={minProfitabilityEuro.value}
            onCloseSettings$={() => {
              settingsSheetOpen.value = false;
            }}
            onSaveProfitabilityTarget$={saveProfitabilityTarget$}
            onVehicleChange$={onVehicleChange$}
            savingProfitTarget={savingProfitTarget.value}
            selectedVehicleId={selectedVehicleId.value}
            uid={user.uid}
            vehicles={vehicles.value}
            vehiclesLoading={vehiclesLoading.value}
          />
        </>
      )}
    </div>
  );
});
