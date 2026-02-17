import { onSnapshot, orderBy, query, type QuerySnapshot } from 'firebase/firestore';
import type { DeviceEntry } from '../../types/device';
import { callRegisterDevice, callRevokeDevice } from '../../firebase/callables';
import { userCollection } from '../../firebase/firestore';

const asDate = (value: unknown): Date | null => {
  if (value && typeof value === 'object' && 'toDate' in (value as { toDate: unknown })) {
    const maybe = value as { toDate: () => Date };
    return maybe.toDate();
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

const mapDevice = (
  id: string,
  data: Record<string, unknown>,
  currentDeviceId: string | null,
): DeviceEntry => {
  const createdAt = asDate(data.firstSeen) ?? asDate(data.createdAt);
  const lastSeenAt = asDate(data.lastSeen) ?? asDate(data.lastSeenAt);
  return {
    id,
    platform: (data.platform as string | undefined) ?? '',
    userAgent: (data.userAgent as string | undefined) ?? '',
    deviceLabel: (data.deviceLabel as string | undefined) ?? undefined,
    createdAt,
    lastSeenAt,
    isCurrent: currentDeviceId ? id === currentDeviceId : Boolean(data.isCurrent ?? false),
  };
};

export const watchDevices = (
  uid: string,
  callback: (devices: DeviceEntry[]) => void,
  currentDeviceId?: string,
): (() => void) => {
  const devicesQuery = query(userCollection(uid, 'devices'), orderBy('lastSeen', 'desc'));
  return onSnapshot(devicesQuery, (snapshot: QuerySnapshot) => {
    const devices = snapshot.docs.map((item) =>
      mapDevice(item.id, item.data() as Record<string, unknown>, currentDeviceId ?? null),
    );
    callback(devices);
  });
};

export const registerDevice = async (params: {
  deviceId: string;
  platform: string;
  userAgent: string;
  replaceDeviceId?: string;
}) => {
  return await callRegisterDevice(params);
};

export const revokeDevice = async (params: { deviceId: string }) => {
  return await callRevokeDevice(params);
};
