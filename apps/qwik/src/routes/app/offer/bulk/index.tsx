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
import { BulkReviewList } from './components/bulk-review-list';
import { BulkSaveFooter } from './components/bulk-save-footer';
import { BulkScreenshotPreviewList } from './components/bulk-screenshot-preview-list';
import { BulkSummaryKpis } from './components/bulk-summary-kpis';
import { BulkUploadStep } from './components/bulk-upload-step';
import { OfferModeToggle } from '../components/offer-mode-toggle';
import {
  resolveLocalTodayIso,
  revokeBulkScreenshotPreviews,
  type BulkScreenshotPreview,
} from './bulk-helpers';
import { resolveBulkDefaultVehicle } from './bulk-review-analysis';
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
    if (files.length === 0) {
      status.value = t(i18n, 'bulkSelectScreenshotButton', 'Choose screenshot');
      return;
    }
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      status.value = t(i18n, 'bulkSelectScreenshotButton', 'Choose screenshot');
      return;
    }
    const timezone = resolveTimeZone();
    if (!timezone) {
      status.value = t(i18n, 'bulkTimezoneMissing', 'Timezone is required on this device.');
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
    commitResult.value = null;
    const { parsedFileCount, failedFileCount, latestErrorMessage } = await runBulkParseImport({
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
    if (parsedFileCount > 0 && failedFileCount === 0) {
      status.value = t(i18n, 'bulkParseSuccess', 'Screenshot parsed. Review rows before saving.');
      return;
    }

    if (parsedFileCount > 0 && failedFileCount > 0) {
      status.value = t(
        i18n,
        'bulkParsePartialSuccess',
        '{parsed} screenshot(s) parsed, {failed} failed. Review rows before saving.',
      )
        .replace('{parsed}', String(parsedFileCount))
        .replace('{failed}', String(failedFileCount));
      return;
    }

    status.value = latestErrorMessage ?? t(
      i18n,
      'offerActionFailedMessage',
      'Unable to complete this action right now. Please try again.',
    );
  });

  const onSave$ = $(async () => {
    const user = auth.user.value;
    if (!user) {
      return;
    }
    if (parsedRows.value.length === 0) {
      status.value = t(i18n, 'bulkNoRowsToSave', 'No valid rows to save.');
      return;
    }
    if (screenshotRefs.value.length === 0) {
      status.value = t(i18n, 'bulkScreenshotMissing', 'Screenshot reference is missing. Parse again.');
      return;
    }
    if (!defaultVehicle) {
      status.value = t(
        i18n,
        'bulkDefaultVehicleRequiredMessage',
        'Set a default vehicle in Settings before saving bulk offers.',
      );
      return;
    }
    const timezone = resolveTimeZone();
    if (!timezone) {
      status.value = t(i18n, 'bulkTimezoneMissing', 'Timezone is required on this device.');
      return;
    }

    saveInFlight.value = true;
    status.value = '';
    try {
      const response = await commitBulkOffersImport({
        deviceId: getDeviceId(),
        timezone,
        serviceDateIso: serviceDateIso.value,
        screenshotRefs: screenshotRefs.value,
        rows: parsedRows.value,
      });
      commitResult.value = response;
      status.value = t(i18n, 'bulkSaveSuccess', 'Rows saved successfully.');
    } catch (error) {
      status.value = resolveUserFacingErrorMessage(i18n, error, 'offer');
    } finally {
      saveInFlight.value = false;
    }
  });

  const user = auth.user.value;
  if (!user) {
    return null;
  }
  const defaultVehicle = resolveBulkDefaultVehicle(vehicles.value, profile.value?.defaultVehicleId ?? null);
  const saveStatus =
    status.value ||
    (parsedRows.value.length > 0 && !defaultVehicle
      ? t(
          i18n,
          'bulkDefaultVehicleRequiredMessage',
          'Set a default vehicle in Settings before saving bulk offers.',
        )
      : '');

  return (
    <div class="ui-stack ui-offer-bulk-root">
      <OfferModeToggle mode="bulk" />

      <BulkUploadStep
        parseInFlight={parseInFlight.value}
        onImportFiles$={onImportFiles$}
      />
      <BulkAnalysisProgress
        activeStep={activeParseStep.value}
        currentIndex={parseBatchIndex.value}
        totalCount={parseBatchTotal.value}
      />
      <BulkScreenshotPreviewList previews={screenshotPreviews.value} />

      <BulkReviewList
        rows={parsedRows.value}
        locale={i18n.locale.value}
        profile={profile.value}
        vehicle={defaultVehicle}
      />
      <BulkInvalidRowsPanel rows={invalidRows.value} />
      <BulkSummaryKpis locale={i18n.locale.value} committed={commitResult.value} />
      <BulkSaveFooter
        canSave={parsedRows.value.length > 0 && !parseInFlight.value && defaultVehicle !== null}
        rowCount={parsedRows.value.length}
        saving={saveInFlight.value}
        status={saveStatus}
        onSave$={onSave$}
      />
    </div>
  );
});
