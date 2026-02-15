import { beforeEach, describe, expect, it, vi } from 'vitest';
import { addDoc } from 'firebase/firestore';
import {
  __resetBillingTelemetryForTests,
  captureBillingPortalTelemetry,
  flushBillingTelemetryQueue,
} from './billing-telemetry';

vi.mock('../../firebase/firestore', () => ({
  getDb: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn(() => ({ id: 'billingTelemetry' })),
  serverTimestamp: vi.fn(() => 'serverTimestamp'),
}));

describe('billing-telemetry', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    const localStorage = {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        storage.delete(key);
      }),
    };

    vi.stubGlobal('window', { localStorage });
    vi.clearAllMocks();
    __resetBillingTelemetryForTests();
  });

  it('serializes concurrent flushes to avoid duplicate writes', async () => {
    const mockedAddDoc = vi.mocked(addDoc);
    mockedAddDoc.mockResolvedValue({} as never);

    captureBillingPortalTelemetry('uid-1', 'offer', 'manage_click', 'session-1', {
      routePath: '/next/app/offer/',
    });

    await Promise.all([flushBillingTelemetryQueue('uid-1'), flushBillingTelemetryQueue('uid-1')]);

    expect(mockedAddDoc).toHaveBeenCalledTimes(1);
  });

  it('re-queues failed events and retries them on the next flush', async () => {
    const mockedAddDoc = vi.mocked(addDoc);
    mockedAddDoc.mockRejectedValueOnce(new Error('temporary'));
    mockedAddDoc.mockResolvedValue({} as never);

    captureBillingPortalTelemetry('uid-1', 'offer', 'manage_click', 'session-1');

    await flushBillingTelemetryQueue('uid-1');
    expect(mockedAddDoc).toHaveBeenCalledTimes(1);

    await flushBillingTelemetryQueue('uid-1');
    expect(mockedAddDoc).toHaveBeenCalledTimes(2);
  });
});
