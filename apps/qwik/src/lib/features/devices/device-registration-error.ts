export interface ActiveDeviceSnapshot {
  active: boolean;
  deviceId: string;
  firstSeen: Date | null;
  lastSeen: Date | null;
  platform: string;
}

const asDate = (value: unknown): Date | null => {
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

export const normalizeCallableErrorCode = (error: unknown): string | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }
  const rawCode = (error as { code?: unknown }).code;
  if (typeof rawCode !== 'string') {
    return null;
  }
  if (rawCode.startsWith('functions/')) {
    return rawCode.slice('functions/'.length);
  }
  return rawCode;
};

export const parseActiveDevicesFromDetails = (details: unknown): ActiveDeviceSnapshot[] => {
  if (!details || typeof details !== 'object') {
    return [];
  }
  const rawList = (details as { activeDevices?: unknown }).activeDevices;
  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }
      const map = entry as Record<string, unknown>;
      const deviceId = typeof map.deviceId === 'string' ? map.deviceId : '';
      if (!deviceId) {
        return null;
      }
      return {
        active: map.active !== false,
        deviceId,
        firstSeen: asDate(map.firstSeen),
        lastSeen: asDate(map.lastSeen),
        platform: typeof map.platform === 'string' ? map.platform : '',
      } satisfies ActiveDeviceSnapshot;
    })
    .filter((entry): entry is ActiveDeviceSnapshot => entry !== null);
};

export const resolveDeviceRegistrationErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  if (error && typeof error === 'object') {
    const rawMessage = (error as { message?: unknown }).message;
    if (typeof rawMessage === 'string' && rawMessage.trim().length > 0) {
      return rawMessage;
    }
  }
  return 'Device registration failed.';
};
