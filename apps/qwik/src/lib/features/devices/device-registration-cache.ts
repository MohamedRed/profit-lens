const deviceRegistrationCacheKey = 'profit-lens-device-registration-v1';
const deviceRegistrationTtlMs = 10 * 60 * 1000;

type DeviceRegistrationCache = {
  uid: string;
  deviceId: string;
  registeredAtMs: number;
};

const readDeviceRegistrationCache = (): DeviceRegistrationCache | null => {
  const raw = localStorage.getItem(deviceRegistrationCacheKey);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<DeviceRegistrationCache>;
    if (
      typeof parsed.uid !== 'string' ||
      typeof parsed.deviceId !== 'string' ||
      typeof parsed.registeredAtMs !== 'number' ||
      !Number.isFinite(parsed.registeredAtMs)
    ) {
      return null;
    }
    return {
      uid: parsed.uid,
      deviceId: parsed.deviceId,
      registeredAtMs: parsed.registeredAtMs,
    };
  } catch {
    return null;
  }
};

export const isDeviceRegistrationFresh = (params: { uid: string; deviceId: string }): boolean => {
  const snapshot = readDeviceRegistrationCache();
  if (!snapshot) {
    return false;
  }
  if (snapshot.uid !== params.uid || snapshot.deviceId !== params.deviceId) {
    return false;
  }
  return Date.now() - snapshot.registeredAtMs < deviceRegistrationTtlMs;
};

export const wasDeviceRegistrationSeen = (params: { uid: string; deviceId: string }): boolean => {
  const snapshot = readDeviceRegistrationCache();
  if (!snapshot) {
    return false;
  }
  return snapshot.uid === params.uid && snapshot.deviceId === params.deviceId;
};

export const markDeviceRegistrationFresh = (params: { uid: string; deviceId: string }): void => {
  const payload: DeviceRegistrationCache = {
    uid: params.uid,
    deviceId: params.deviceId,
    registeredAtMs: Date.now(),
  };
  localStorage.setItem(deviceRegistrationCacheKey, JSON.stringify(payload));
};

export const clearDeviceRegistrationCache = (): void => {
  localStorage.removeItem(deviceRegistrationCacheKey);
};
