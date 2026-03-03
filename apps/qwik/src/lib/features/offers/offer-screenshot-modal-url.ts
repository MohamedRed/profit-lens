const isBlobUrl = (value: string): boolean => value.startsWith('blob:');

export const createOfferScreenshotModalUrl = (file: File): string => {
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    throw new Error('Unable to create screenshot preview URL.');
  }
  return URL.createObjectURL(file);
};

export const revokeOfferScreenshotModalUrl = (url: string | null | undefined): void => {
  if (!url || !isBlobUrl(url)) {
    return;
  }
  if (typeof URL === 'undefined' || typeof URL.revokeObjectURL !== 'function') {
    return;
  }
  URL.revokeObjectURL(url);
};
