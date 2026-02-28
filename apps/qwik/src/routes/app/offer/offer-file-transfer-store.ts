const OFFER_SCREENSHOT_STORE_KEY = "__plOfferScreenshotStore__";

type StagedOfferScreenshotFile = {
  file: File;
  stagedAt: number;
};

declare global {
  interface Window {
    [OFFER_SCREENSHOT_STORE_KEY]?: Map<string, StagedOfferScreenshotFile>;
  }
}

const MAX_STAGED_FILE_AGE_MS = 5 * 60 * 1000;

const getOfferScreenshotStore = (): Map<string, StagedOfferScreenshotFile> => {
  if (typeof window === "undefined") {
    throw new Error("Offer screenshot file store is only available in the browser.");
  }
  const existingStore = window[OFFER_SCREENSHOT_STORE_KEY];
  if (existingStore) {
    return existingStore;
  }
  const nextStore = new Map<string, StagedOfferScreenshotFile>();
  window[OFFER_SCREENSHOT_STORE_KEY] = nextStore;
  return nextStore;
};

const createTransferToken = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `offer-file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const pruneExpiredEntries = (store: Map<string, StagedOfferScreenshotFile>, now: number): void => {
  for (const [token, entry] of store.entries()) {
    if (now - entry.stagedAt > MAX_STAGED_FILE_AGE_MS) {
      store.delete(token);
    }
  }
};

export const stageOfferScreenshotFile = (file: File): string => {
  const store = getOfferScreenshotStore();
  const now = Date.now();
  pruneExpiredEntries(store, now);

  const token = createTransferToken();
  store.set(token, {
    file,
    stagedAt: now,
  });
  return token;
};

export const takeOfferScreenshotFile = (token: string): File | null => {
  const store = getOfferScreenshotStore();
  const staged = store.get(token) ?? null;
  if (!staged) {
    return null;
  }
  store.delete(token);
  return staged.file;
};
