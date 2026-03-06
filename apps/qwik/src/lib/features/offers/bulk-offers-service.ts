import { callCommitBulkOffersImport, callParseBulkOffersScreenshot } from '../../firebase/callables';
import { encodeScreenshotForAnalyze } from './offer-screenshot-encoder';
import type {
  BulkCommitRow,
  BulkSourceApp,
  CommitBulkOffersImportResponse,
  ParseBulkOffersScreenshotResponse,
  ScreenshotRef,
} from '../../types/bulk-offers';

export const parseBulkOffersScreenshot = async (params: {
  deviceId: string;
  vehicleId?: string;
  timezone: string;
  serviceDateIso: string;
  file: File;
  sourceApp?: BulkSourceApp;
}): Promise<ParseBulkOffersScreenshotResponse> => {
  const { imageBase64, mimeType } = await encodeScreenshotForAnalyze(params.file);
  const payload: Record<string, unknown> = {
    deviceId: params.deviceId,
    vehicleId: params.vehicleId,
    timezone: params.timezone,
    serviceDateIso: params.serviceDateIso,
    imageBase64,
    mimeType,
    sourceApp: params.sourceApp ?? 'other',
  };
  return (await callParseBulkOffersScreenshot(payload)) as unknown as ParseBulkOffersScreenshotResponse;
};

export const commitBulkOffersImport = async (params: {
  deviceId: string;
  timezone: string;
  serviceDateIso: string;
  vehicleId?: string;
  sourceApp?: BulkSourceApp;
  screenshotRefs: ScreenshotRef[];
  rows: BulkCommitRow[];
}): Promise<CommitBulkOffersImportResponse> => {
  const payload: Record<string, unknown> = {
    deviceId: params.deviceId,
    timezone: params.timezone,
    serviceDateIso: params.serviceDateIso,
    vehicleId: params.vehicleId,
    sourceApp: params.sourceApp ?? 'other',
    screenshotRefs: params.screenshotRefs,
    rows: params.rows,
  };
  return (await callCommitBulkOffersImport(payload)) as unknown as CommitBulkOffersImportResponse;
};
