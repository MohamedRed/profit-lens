const stagedFiles = new Map<string, File>();

const createTransferToken = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `offer-file-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const stageOfferScreenshotFile = (file: File): string => {
  const token = createTransferToken();
  stagedFiles.set(token, file);
  return token;
};

export const takeOfferScreenshotFile = (token: string): File | null => {
  const file = stagedFiles.get(token) ?? null;
  if (file) {
    stagedFiles.delete(token);
  }
  return file;
};
