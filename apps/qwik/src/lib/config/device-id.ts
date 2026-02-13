const storageKey = 'profit-lens-device-id';

const generateDeviceId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const getDeviceId = (): string => {
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }
  const created = generateDeviceId();
  localStorage.setItem(storageKey, created);
  return created;
};
