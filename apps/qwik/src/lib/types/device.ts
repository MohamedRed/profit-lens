export interface DeviceEntry {
  id: string;
  platform?: string;
  userAgent?: string;
  deviceLabel?: string;
  lastSeenAt?: Date | null;
  createdAt?: Date | null;
  isCurrent?: boolean;
}
