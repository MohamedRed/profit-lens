import { describe, expect, it } from 'vitest';
import {
  normalizeCallableErrorCode,
  parseActiveDevicesFromDetails,
  resolveDeviceRegistrationErrorMessage,
} from './device-registration-error';

describe('device-registration-error', () => {
  it('normalizes Firebase functions error codes', () => {
    expect(normalizeCallableErrorCode({ code: 'functions/resource-exhausted' })).toBe(
      'resource-exhausted',
    );
    expect(normalizeCallableErrorCode({ code: 'failed-precondition' })).toBe('failed-precondition');
    expect(normalizeCallableErrorCode({})).toBeNull();
  });

  it('parses active devices from callable details', () => {
    const list = parseActiveDevicesFromDetails({
      activeDevices: [
        {
          deviceId: 'device-1',
          platform: 'web',
          firstSeen: '2026-02-17T09:00:00.000Z',
          lastSeen: '2026-02-17T10:00:00.000Z',
          active: true,
        },
      ],
    });

    expect(list).toHaveLength(1);
    expect(list[0].deviceId).toBe('device-1');
    expect(list[0].platform).toBe('web');
    expect(list[0].firstSeen?.toISOString()).toBe('2026-02-17T09:00:00.000Z');
    expect(list[0].lastSeen?.toISOString()).toBe('2026-02-17T10:00:00.000Z');
    expect(list[0].active).toBe(true);
  });

  it('returns empty list when details are not parseable', () => {
    expect(parseActiveDevicesFromDetails(undefined)).toEqual([]);
    expect(parseActiveDevicesFromDetails({})).toEqual([]);
    expect(parseActiveDevicesFromDetails({ activeDevices: [null, {}] })).toEqual([]);
  });

  it('resolves user facing error message', () => {
    expect(resolveDeviceRegistrationErrorMessage(new Error('Device failed'))).toBe('Device failed');
    expect(resolveDeviceRegistrationErrorMessage({ message: 'Callable failed' })).toBe(
      'Callable failed',
    );
    expect(resolveDeviceRegistrationErrorMessage(undefined)).toBe('Device registration failed.');
  });
});
