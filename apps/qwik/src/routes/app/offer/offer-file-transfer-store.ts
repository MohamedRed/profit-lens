const OFFER_SCREENSHOT_STORE_KEY = "__plOfferScreenshotStore__";

declare global {
  interface Window {
    [OFFER_SCREENSHOT_STORE_KEY]?: Map<string, File>;
  }
}

const getOfferScreenshotStore = (): Map<string, File> => {
  if (typeof window === "undefined") {
    throw new Error("Offer screenshot file store is only available in the browser.");
  }
  const existingStore = window[OFFER_SCREENSHOT_STORE_KEY];
  if (existingStore) {
    return existingStore;
  }
  const nextStore = new Map<string, File>();
  window[OFFER_SCREENSHOT_STORE_KEY] = nextStore;
  return nextStore;
};

const createTransferToken = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `offer-file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const stageOfferScreenshotFile = (file: File): string => {
  const token = createTransferToken();
  getOfferScreenshotStore().set(token, file);
  return token;
};

export const takeOfferScreenshotFile = (token: string): File | null => {
  const store = getOfferScreenshotStore();
  const file = store.get(token) ?? null;
  if (file) {
    store.delete(token);
  }
  return file;
};
