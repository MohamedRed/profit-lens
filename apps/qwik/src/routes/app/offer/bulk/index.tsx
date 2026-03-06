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
import { BulkInvalidRowsPanel } from './components/bulk-invalid-rows-panel';
import { BulkAnalysisProgress } from './components/bulk-analysis-progress';
import { BulkReviewList } from './components/bulk-review-list';
import { BulkSaveFooter } from './components/bulk-save-footer';
import { BulkScreenshotPreviewList } from './components/bulk-screenshot-preview-list';
import { BulkSummaryKpis } from './components/bulk-summary-kpis';
import { BulkUploadStep } from './components/bulk-upload-step';
import { OfferModeToggle } from '../components/offer-mode-toggle';
import {
  patchBulkRow,
  removeBulkRow,
  resolveLocalTodayIso,
  revokeBulkScreenshotPreviews,
  type BulkScreenshotPreview,
} from './bulk-helpers';
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
  const parsedRows = useSignal<BulkParsedRow[]>([]);
  const invalidRows = useSignal<BulkInvalidRow[]>([]);
  const screenshotRefs = useSignal<ScreenshotRef[]>([]);
  const screenshotPreviews = useSignal<BulkScreenshotPreview[]>([]);
  const status = useSignal('');
  const commitResult = useSignal<CommitBulkOffersImportResponse | null>(null);

  useVisibleTask$(({ track }) => {
    const isReady = track(() => auth.ready.value);
    const user = track(() => auth.user.value);
    if (!isReady || !user) {
      if (screenshotPreviews.value.length > 0) {
        revokeBulkScreenshotPreviews(screenshotPreviews.value);
        screenshotPreviews.value = [];
      }
    }
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

  const onPatchRow$ = $((index: number, patch: Partial<BulkParsedRow>) => {
    parsedRows.value = patchBulkRow(parsedRows.value, index, patch);
  });

  const onRemoveRow$ = $((index: number) => {
    parsedRows.value = removeBulkRow(parsedRows.value, index);
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

  return (
    <div class="ui-stack ui-offer-bulk-root">
      <OfferModeToggle mode="bulk" />

      <BulkUploadStep
        serviceDateIso={serviceDateIso.value}
        parseInFlight={parseInFlight.value}
        onServiceDateChange$={$((nextDateIso: string) => {
          serviceDateIso.value = nextDateIso;
        })}
        onImportFiles$={onImportFiles$}
      />
      <BulkAnalysisProgress
        activeStep={activeParseStep.value}
        currentIndex={parseBatchIndex.value}
        totalCount={parseBatchTotal.value}
      />
      <BulkScreenshotPreviewList previews={screenshotPreviews.value} />

      <BulkReviewList rows={parsedRows.value} onPatch$={onPatchRow$} onRemove$={onRemoveRow$} />
      <BulkInvalidRowsPanel rows={invalidRows.value} />
      <BulkSummaryKpis locale={i18n.locale.value} committed={commitResult.value} />
      <BulkSaveFooter
        canSave={parsedRows.value.length > 0 && !parseInFlight.value}
        rowCount={parsedRows.value.length}
        saving={saveInFlight.value}
        status={status.value}
        onSave$={onSave$}
      />
    </div>
  );
});
