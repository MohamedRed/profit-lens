const tabScrollStorageKey = 'pl-tab-scroll-memory-v1';

const canUseStorage = (): boolean => {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
};

const readMap = (): Record<string, number> => {
  if (!canUseStorage()) {
    return {};
  }
  const raw = sessionStorage.getItem(tabScrollStorageKey);
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const num = Number(value);
      if (Number.isFinite(num) && num >= 0) {
        next[key] = Math.round(num);
      }
    }
    return next;
  } catch {
    return {};
  }
};

const writeMap = (next: Record<string, number>): void => {
  if (!canUseStorage()) {
    return;
  }
  sessionStorage.setItem(tabScrollStorageKey, JSON.stringify(next));
};

export const saveTabScrollY = (tabSectionKey: string, scrollY: number): void => {
  if (!tabSectionKey || !Number.isFinite(scrollY)) {
    return;
  }
  const current = readMap();
  current[tabSectionKey] = Math.max(0, Math.round(scrollY));
  writeMap(current);
};

export const readTabScrollY = (tabSectionKey: string): number | null => {
  if (!tabSectionKey) {
    return null;
  }
  const current = readMap();
  const value = current[tabSectionKey];
  return Number.isFinite(value) ? value : null;
};
