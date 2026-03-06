import type { BulkParsedRow } from '../../../../lib/types/bulk-offers';
import {
  createOfferScreenshotModalUrl,
  revokeOfferScreenshotModalUrl,
} from '../../../../lib/features/offers/offer-screenshot-modal-url';

export interface BulkScreenshotPreview {
  id: string;
  fileName: string;
  url: string;
}

let bulkPreviewSequence = 0;

export const resolveLocalTodayIso = (now: Date = new Date()): string => {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

export const patchBulkRow = (
  rows: BulkParsedRow[],
  index: number,
  patch: Partial<BulkParsedRow>,
): BulkParsedRow[] => {
  return rows.map((row, rowIndex) => {
    if (rowIndex !== index) {
      return row;
    }
    return { ...row, ...patch };
  });
};

export const removeBulkRow = (rows: BulkParsedRow[], index: number): BulkParsedRow[] => {
  return rows.filter((_, rowIndex) => rowIndex !== index);
};

export const createBulkScreenshotPreviews = (files: File[]): BulkScreenshotPreview[] => {
  return files.map((file) => ({
    id: `bulk-shot-${Date.now()}-${bulkPreviewSequence += 1}`,
    fileName: file.name,
    url: createOfferScreenshotModalUrl(file),
  }));
};

export const revokeBulkScreenshotPreviews = (previews: BulkScreenshotPreview[]): void => {
  previews.forEach((preview) => {
    revokeOfferScreenshotModalUrl(preview.url);
  });
};
