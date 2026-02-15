import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDb } from '../../firebase/firestore';

export type BillingPortalSource = 'offer' | 'settings';
export type BillingPortalStage =
  | 'manage_click'
  | 'portal_url_resolved'
  | 'portal_redirect_start'
  | 'portal_pagehide';

interface BillingTelemetryEvent {
  uid: string;
  source: BillingPortalSource;
  stage: BillingPortalStage;
  sessionId: string;
  clientAtMs: number;
  payload: Record<string, unknown>;
}

const STORAGE_KEY = 'pl-billing-telemetry-queue-v1';
const MAX_QUEUE_EVENTS = 60;
const flushInFlightByUid = new Map<string, Promise<void>>();

const canUseBrowserStorage = (): boolean => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

const readQueue = (): BillingTelemetryEvent[] => {
  if (!canUseBrowserStorage()) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as BillingTelemetryEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeQueue = (events: BillingTelemetryEvent[]): void => {
  if (!canUseBrowserStorage()) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_QUEUE_EVENTS)));
  } catch {
    // Ignore telemetry storage errors.
  }
};

const mergeQueue = (events: BillingTelemetryEvent[]): void => {
  const existing = readQueue();
  writeQueue([...existing, ...events]);
};

const pushToQueue = (event: BillingTelemetryEvent): void => {
  const queue = readQueue();
  queue.push(event);
  writeQueue(queue);
};

const createSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const createBillingPortalSessionId = (): string => createSessionId();

export const captureBillingPortalTelemetry = (
  uid: string,
  source: BillingPortalSource,
  stage: BillingPortalStage,
  sessionId: string,
  payload: Record<string, unknown> = {},
): void => {
  pushToQueue({
    uid,
    source,
    stage,
    sessionId,
    clientAtMs: Date.now(),
    payload,
  });
};

export const flushBillingTelemetryQueue = async (uid: string): Promise<void> => {
  if (!uid) {
    return;
  }
  const activeFlush = flushInFlightByUid.get(uid);
  if (activeFlush) {
    await activeFlush;
    return;
  }

  const flushPromise = (async () => {
    const targetCollection = collection(getDb(), 'users', uid, 'billingTelemetry');
    while (true) {
      const queue = readQueue();
      if (!queue.length) {
        return;
      }
      const pendingForUser = queue.filter((event) => event.uid === uid);
      if (!pendingForUser.length) {
        return;
      }
      const untouched = queue.filter((event) => event.uid !== uid);
      writeQueue(untouched);

      const failed: BillingTelemetryEvent[] = [];
      for (const event of pendingForUser) {
        try {
          await addDoc(targetCollection, {
            source: event.source,
            stage: event.stage,
            sessionId: event.sessionId,
            clientAtMs: event.clientAtMs,
            payload: event.payload,
            createdAt: serverTimestamp(),
          });
        } catch {
          failed.push(event);
        }
      }

      if (failed.length > 0) {
        mergeQueue(failed);
        return;
      }
    }
  })();

  flushInFlightByUid.set(uid, flushPromise);
  try {
    await flushPromise;
  } finally {
    flushInFlightByUid.delete(uid);
  }
};

export const __resetBillingTelemetryForTests = (): void => {
  flushInFlightByUid.clear();
  if (canUseBrowserStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};
