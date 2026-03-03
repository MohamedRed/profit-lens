const vehiclePresenceHintKeyPrefix = 'profit-lens.vehicle-presence.';

const resolveKey = (uid: string): string => {
  return `${vehiclePresenceHintKeyPrefix}${uid}`;
};

export const readVehiclePresenceHint = (uid: string): boolean | null => {
  if (typeof window === 'undefined' || !uid) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(resolveKey(uid));
    if (raw === '1') {
      return true;
    }
    if (raw === '0') {
      return false;
    }
  } catch {
    // Ignore storage failures and treat as unknown hint.
  }
  return null;
};

export const writeVehiclePresenceHint = (uid: string, hasVehicles: boolean): void => {
  if (typeof window === 'undefined' || !uid) {
    return;
  }
  try {
    window.localStorage.setItem(resolveKey(uid), hasVehicles ? '1' : '0');
  } catch {
    // Ignore storage failures and keep runtime behavior unaffected.
  }
};
