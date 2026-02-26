import { type CollectionReference, type DocumentData, Timestamp } from "firebase-admin/firestore";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_INACTIVE_RETENTION_DAYS = 30;
const DEFAULT_MAX_DELETES_PER_RUN = 25;

interface PruneInactiveDevicesParams {
  devicesRef: CollectionReference<DocumentData>;
  now?: Timestamp;
  retentionDays?: number;
  maxDeletes?: number;
}

interface DeviceStalenessSnapshot {
  id: string;
  updatedAtMs: number;
}

const asDate = (value: unknown): Date | null => {
  if (value && typeof value === "object" && "toDate" in (value as { toDate?: unknown })) {
    const maybeTimestamp = value as { toDate: () => Date };
    return maybeTimestamp.toDate();
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
};

const resolveUpdatedAtMs = (data: Record<string, unknown>): number => {
  const candidates = [data.updatedAt, data.lastSeen, data.firstSeen, data.createdAt];
  for (const value of candidates) {
    const parsed = asDate(value);
    if (parsed) {
      return parsed.getTime();
    }
  }
  return 0;
};

export const pruneInactiveDevices = async (
  params: PruneInactiveDevicesParams,
): Promise<{ deletedCount: number }> => {
  const now = params.now ?? Timestamp.now();
  const retentionDays = params.retentionDays ?? DEFAULT_INACTIVE_RETENTION_DAYS;
  const maxDeletes = params.maxDeletes ?? DEFAULT_MAX_DELETES_PER_RUN;
  const cutoffMs = now.toDate().getTime() - retentionDays * MS_PER_DAY;
  const snapshot = await params.devicesRef.where("active", "==", false).get();
  const staleDevices = snapshot.docs
    .map((doc): DeviceStalenessSnapshot => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        updatedAtMs: resolveUpdatedAtMs(data),
      };
    })
    .filter((device) => device.updatedAtMs <= cutoffMs)
    .sort((left, right) => left.updatedAtMs - right.updatedAtMs)
    .slice(0, maxDeletes);

  await Promise.all(staleDevices.map((device) => params.devicesRef.doc(device.id).delete()));

  return { deletedCount: staleDevices.length };
};
