import type { Signal } from '@builder.io/qwik';
import { resolveUserFacingErrorMessage } from '../../../../lib/errors/user-facing-error';
import { parseBulkOffersScreenshot } from '../../../../lib/features/offers/bulk-offers-service';
import type { I18nStore } from '../../../../lib/i18n/i18n-context';
import type { BulkInvalidRow, BulkParsedRow, ScreenshotRef } from '../../../../lib/types/bulk-offers';
import { startOfferAnalysisProgressDriver, type OfferAnalysisProgressStep } from '../offer-analysis-progress';
import { createBulkScreenshotPreviews, type BulkScreenshotPreview } from './bulk-helpers';

interface RunBulkParseImportParams {
  deviceId: string;
  files: File[];
  timezone: string;
  serviceDateIso: string;
  vehicleId?: string;
  i18n: I18nStore;
  parseRunId: Signal<number>;
  parseInFlight: Signal<boolean>;
  activeParseStep: Signal<OfferAnalysisProgressStep | null>;
  parseBatchIndex: Signal<number>;
  parseBatchTotal: Signal<number>;
  parsedRows: Signal<BulkParsedRow[]>;
  invalidRows: Signal<BulkInvalidRow[]>;
  screenshotRefs: Signal<ScreenshotRef[]>;
  screenshotPreviews: Signal<BulkScreenshotPreview[]>;
}

export interface RunBulkParseImportResult {
  parsedFileCount: number;
  failedFileCount: number;
  latestErrorMessage: string | null;
}

export const runBulkParseImport = async (
  params: RunBulkParseImportParams,
): Promise<RunBulkParseImportResult> => {
  const runId = params.parseRunId.value + 1;
  params.parseRunId.value = runId;
  params.parseInFlight.value = true;
  params.parseBatchIndex.value = 0;
  params.parseBatchTotal.value = params.files.length;
  params.activeParseStep.value = 'extracting';
  params.screenshotPreviews.value = [
    ...params.screenshotPreviews.value,
    ...createBulkScreenshotPreviews(params.files),
  ];

  let parsedFileCount = 0;
  let failedFileCount = 0;
  let latestErrorMessage: string | null = null;

  for (const [index, file] of params.files.entries()) {
    if (params.parseRunId.value !== runId) {
      break;
    }
    params.parseBatchIndex.value = index + 1;
    params.activeParseStep.value = 'extracting';
    const progressDriver = startOfferAnalysisProgressDriver({
      isActive: () => params.parseRunId.value === runId && params.parseInFlight.value,
      onStepChange: (step) => {
        if (params.parseRunId.value !== runId) {
          return;
        }
        params.activeParseStep.value = step;
      },
    });
    try {
      const response = await parseBulkOffersScreenshot({
        deviceId: params.deviceId,
        timezone: params.timezone,
        serviceDateIso: params.serviceDateIso,
        vehicleId: params.vehicleId,
        file,
      });
      const rowOffset = params.parsedRows.value.length;
      params.parsedRows.value = [
        ...params.parsedRows.value,
        ...response.parsedRows.map((row, rowIndex) => ({ ...row, sourceIndex: rowOffset + rowIndex })),
      ];
      params.invalidRows.value = [
        ...params.invalidRows.value,
        ...response.invalidRows.map((row) => ({ ...row, sourceIndex: row.sourceIndex + rowOffset })),
      ];
      params.screenshotRefs.value = [
        ...params.screenshotRefs.value.filter((item) => item.path !== response.screenshotRef.path),
        response.screenshotRef,
      ];
      parsedFileCount += 1;
    } catch (error) {
      failedFileCount += 1;
      latestErrorMessage = resolveUserFacingErrorMessage(params.i18n, error, 'offer');
    } finally {
      await progressDriver.waitForMinimumDuration();
      progressDriver.cancel();
    }
  }

  params.activeParseStep.value = null;
  params.parseBatchIndex.value = 0;
  params.parseBatchTotal.value = 0;
  params.parseInFlight.value = false;

  return { parsedFileCount, failedFileCount, latestErrorMessage };
};
