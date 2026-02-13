import { onSnapshot, orderBy, query, type QuerySnapshot } from 'firebase/firestore';
import type { DeviceEntry } from '../../types/device';
import { callRegisterDevice, callRevokeDevice } from '../../firebase/callables';
import { userCollection } from '../../firebase/firestore';

const asDate = (value: unknown): Date | null => {
  if (value && typeof value === 'object' && 'toDate' in (value as { toDate: unknown })) {
    const maybe = value as { toDate: () => Date };
    return maybe.toDate();
  }
  return null;
};

const mapDevice = (id: string, data: Record<string, unknown>): DeviceEntry => {
  return {
    id,
    platform: (data.platform as string | undefined) ?? undefined,
    userAgent: (data.userAgent as string | undefined) ?? undefined,
    deviceLabel: (data.deviceLabel as string | undefined) ?? undefined,
    createdAt: asDate(data.createdAt),
    lastSeenAt: asDate(data.lastSeenAt),
    isCurrent: Boolean(data.isCurrent ?? false),
  };
};

export const watchDevices = (
  uid: string,
  callback: (devices: DeviceEntry[]) => void,
): (() => void) => {
  const devicesQuery = query(userCollection(uid, 'devices'), orderBy('createdAt', 'asc'));
  return onSnapshot(devicesQuery, (snapshot: QuerySnapshot) => {
    const devices = snapshot.docs.map((item) => mapDevice(item.id, item.data() as Record<string, unknown>));
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
