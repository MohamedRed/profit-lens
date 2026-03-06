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
import { BulkInvalidRowsPanel } from './components/bulk-invalid-rows-panel';
import { BulkAnalysisProgress } from './components/bulk-analysis-progress';
import { BulkSavedResults } from './components/bulk-saved-results';
import { BulkScreenshotPreviewList } from './components/bulk-screenshot-preview-list';
import { BulkStatusBanner } from './components/bulk-status-banner';
import { BulkSummaryKpis } from './components/bulk-summary-kpis';
import { BulkUploadStep } from './components/bulk-upload-step';
import { OfferModeToggle } from '../components/offer-mode-toggle';
import {
  resolveLocalTodayIso,
  revokeBulkScreenshotPreviews,
  type BulkScreenshotPreview,
} from './bulk-helpers';
import { resolveBulkDefaultVehicle } from './bulk-default-vehicle';
import { type OfferAnalysisProgressStep } from '../offer-analysis-progress';
import { runBulkParseImport } from './bulk-parse-import';

const resolveTimeZone = (): string | null => {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return zone && zone.trim().length > 0 ? zone : null;
  } catch {
    return null;
  }
};

export default component$(() => {
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
  const vehicles = useSignal<VehicleProfile[]>([]);
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
      if (screenshotPreviews.value.length > 0) {
        revokeBulkScreenshotPreviews(screenshotPreviews.value);
        screenshotPreviews.value = [];
      }
      return;
    }

    const unsubscribeProfile = watchUserProfile(user.uid, user.email ?? null, (nextProfile) => {
      profile.value = nextProfile;
    });
    const unsubscribeVehicles = watchVehicles(user.uid, (nextVehicles) => {
      vehicles.value = nextVehicles;
    });

    cleanup(() => {
      unsubscribeProfile();
      unsubscribeVehicles();
    });
  });

  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      revokeBulkScreenshotPreviews(screenshotPreviews.value);
    });
  });

  const onImportFiles$ = $(async (files: File[]) => {
    const user = auth.user.value;
    if (!user) {
      return;
    }
    if (parseInFlight.value) {
      return;
    }
    if (!defaultVehicle) {
      status.value = t(
        i18n,
        'bulkDefaultVehicleRequiredMessage',
        'Set a default vehicle in Settings before importing bulk offers.',
      );
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
      status.value = latestErrorMessage ?? t(
        i18n,
        'bulkNoRowsToSave',
        'No valid rows to save.',
      );
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
        screenshotRefs: screenshotRefs.value,
        rows: parsedRows.value,
      });
      commitResult.value = response;
      parsedRows.value = [];
      screenshotRefs.value = [];
      status.value =
        failedFileCount > 0
          ? t(
              i18n,
              'bulkAutoSavePartialSuccess',
              '{saved} deliveries saved automatically. {failed} screenshot(s) failed to parse.',
            )
              .replace('{saved}', String(response.savedCount))
              .replace('{failed}', String(failedFileCount))
          : t(i18n, 'bulkAutoSaveSuccess', '{saved} deliveries saved automatically.').replace(
              '{saved}',
              String(response.savedCount),
            );
      statusTone.value = 'success';
      return;
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, 'offer');
      statusTone.value = 'error';
      return;
    } finally {
      saveInFlight.value = false;
    }
  });

  const user = auth.user.value;
  if (!user) {
    return null;
  }
  const defaultVehicle = resolveBulkDefaultVehicle(vehicles.value, profile.value?.defaultVehicleId ?? null);

  return (
    <div class="ui-stack ui-offer-bulk-root">
      <OfferModeToggle mode="bulk" />

      <BulkUploadStep
        busy={parseInFlight.value || saveInFlight.value}
        disabled={defaultVehicle === null}
        onImportFiles$={onImportFiles$}
      />
      <BulkAnalysisProgress
        activeStep={activeParseStep.value}
        currentIndex={parseBatchIndex.value}
        totalCount={parseBatchTotal.value}
      />
      <BulkStatusBanner message={status.value} tone={statusTone.value} />
      <BulkScreenshotPreviewList previews={screenshotPreviews.value} />
      <BulkInvalidRowsPanel rows={invalidRows.value} />
      <BulkSavedResults
        minProfitabilityEuro={profile.value?.minProfitabilityEuro ?? 0}
        records={commitResult.value?.records ?? []}
      />
      <BulkSummaryKpis locale={i18n.locale.value} committed={commitResult.value} />
    </div>
  );
});
