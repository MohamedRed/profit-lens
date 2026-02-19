import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerDeviceWithBackoff } from './register-device-with-backoff';
import { registerDevice } from './devices-service';

vi.mock('./devices-service', () => ({
  registerDevice: vi.fn(),
}));

const payload = {
  deviceId: 'device-id',
  platform: 'web',
  userAgent: 'test-agent',
};

describe('register-device-with-backoff', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retries transient registration failures', async () => {
    const mocked = vi.mocked(registerDevice);
    mocked
      .mockRejectedValueOnce({ code: 'functions/unavailable', message: 'Service unavailable.' })
      .mockRejectedValueOnce({ code: 'deadline-exceeded', message: 'Try again.' })
      .mockResolvedValueOnce({ status: 'ok' });

    const request = registerDeviceWithBackoff(payload, 4);
    await vi.runAllTimersAsync();
    await request;

    expect(mocked).toHaveBeenCalledTimes(3);
  });

  it('does not retry device-limit failures', async () => {
    const mocked = vi.mocked(registerDevice);
    const limitError = {
      code: 'functions/resource-exhausted',
      message: 'Device limit reached.',
      details: { activeDevices: [{ deviceId: 'other-device' }] },
    };
    mocked.mockRejectedValueOnce(limitError);

    await expect(registerDeviceWithBackoff(payload, 4)).rejects.toEqual(limitError);
    expect(mocked).toHaveBeenCalledTimes(1);
  });
});

