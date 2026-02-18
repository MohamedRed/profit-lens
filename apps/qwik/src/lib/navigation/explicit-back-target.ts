const explicitBackTargetKey = 'pl-explicit-back-target-v1';

const canUseStorage = (): boolean => {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
};

const parseMap = (raw: string | null): Record<string, string> => {
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.startsWith('/next/app/')) {
        next[key] = value;
      }
    }
    return next;
  } catch {
    return {};
  }
};

const readMap = (): Record<string, string> => {
  if (!canUseStorage()) {
    return {};
  }
  return parseMap(sessionStorage.getItem(explicitBackTargetKey));
};

const writeMap = (next: Record<string, string>): void => {
  if (!canUseStorage()) {
    return;
  }
  sessionStorage.setItem(explicitBackTargetKey, JSON.stringify(next));
};

export const saveExplicitBackTarget = (routeKey: string, targetHref: string): void => {
  if (!routeKey || !targetHref.startsWith('/next/app/')) {
    return;
  }
  const current = readMap();
  current[routeKey] = targetHref;
  writeMap(current);
};

export const readExplicitBackTarget = (routeKey: string): string | null => {
  if (!routeKey) {
    return null;
  }
  const current = readMap();
  return current[routeKey] ?? null;
};
