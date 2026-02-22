const scrollStorageKey = 'pl-history-scroll-y';

const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
};

export const readHistoryScrollY = (): number | null => {
  if (!isBrowser()) {
    return null;
  }
  const raw = sessionStorage.getItem(scrollStorageKey);
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
};

export const saveHistoryScrollY = (value: number): void => {
  if (!isBrowser()) {
    return;
  }
  sessionStorage.setItem(scrollStorageKey, String(Math.max(0, Math.round(value))));
};
