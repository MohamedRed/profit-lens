import { $, component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';
import { useAuth } from '../../../../lib/auth/auth-context';
import { getDeviceId } from '../../../../lib/config/device-id';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import { commitBulkOffersImport } from '../../../../lib/features/offers/bulk-offers-service';
import { t, useI18n } from '../../../../lib/i18n/i18n-context';
import type {
  BulkInvalidRow,
  BulkParsedRow,
  CommitBulkOffersImportResponse,
  ScreenshotRef,
} from '../../../../lib/types/bulk-offers';
import { OfferSetupModalStack } from '../components/offer-setup-modal-stack';
import { resolveRemainingOffers, useOfferEntitlement } from '../components/use-offer-entitlement';
import { saveProfitabilityTargetAction } from '../offer-ui-actions';
import { type OfferAnalysisProgressStep } from '../offer-analysis-progress';
import { buildBulkQuotaExceededMessage, resolveTimeZone } from './bulk-offer-quota';
import { BulkAnalysisProgress } from './components/bulk-analysis-progress';
import { BulkImportHero } from './components/bulk-import-hero';
import { BulkInvalidRowsPanel } from './components/bulk-invalid-rows-panel';
import { BulkOfferQuotaNotice } from './components/bulk-offer-quota-notice';
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
import { useBulkOfferSetupState } from './use-bulk-offer-setup-state';

export const BulkOfferFlow = component$(() => {
  const auth = useAuth();
  const i18n = useI18n();
  const { entitlement, usage } = useOfferEntitlement(auth);
  const { profile, minProfitabilityEuro, vehicles, vehiclesLoading, selectedVehicleId } = useBulkOfferSetupState(auth);
  const serviceDateIso = useSignal(resolveLocalTodayIso());
  const parseInFlight = useSignal(false);
  const parseRunId = useSignal(0);
  const activeParseStep = useSignal<OfferAnalysisProgressStep | null>(null);
  const parseBatchIndex = useSignal(0);
  const parseBatchTotal = useSignal(0);
  const saveInFlight = useSignal(false);
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
    const remainingOffers = resolveRemainingOffers(entitlement.value, usage.value);
    if (remainingOffers !== null && remainingOffers <= 0) {
      status.value = t(i18n, 'offerLimitReachedMessage', 'You have reached your monthly offer limit. Upgrade to continue.');
      statusTone.value = 'error';
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
    const remainingAfterParse = resolveRemainingOffers(entitlement.value, usage.value);
    if (remainingAfterParse !== null && parsedRows.value.length > remainingAfterParse) {
      status.value = buildBulkQuotaExceededMessage(i18n, parsedRows.value.length, remainingAfterParse);
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
  const remainingOffers = resolveRemainingOffers(entitlement.value, usage.value);
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
          <BulkOfferQuotaNotice remainingOffers={remainingOffers} />

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
