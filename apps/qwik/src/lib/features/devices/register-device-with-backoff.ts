import { normalizeCallableErrorCode } from './device-registration-error';
import { registerDevice } from './devices-service';

const transientCodes = new Set(['unavailable', 'deadline-exceeded', 'internal', 'unknown']);
const transientMessageFragments = ['no available instance', 'try again', 'temporarily unavailable'];

type RegisterDevicePayload = {
  deviceId: string;
  platform: string;
  userAgent: string;
  replaceDeviceId?: string;
};

const sleep = (delayMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, delayMs);
  });

const hasDeviceLimitDetails = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const details = (error as { details?: unknown }).details;
  if (!details || typeof details !== 'object') {
    return false;
  }
  const activeDevices = (details as { activeDevices?: unknown }).activeDevices;
  return Array.isArray(activeDevices) && activeDevices.length >= 0;
};

const isTransientRegisterError = (error: unknown): boolean => {
  const code = normalizeCallableErrorCode(error);
  if (code) {
    const normalizedCode = code.toLowerCase();
    if (transientCodes.has(normalizedCode)) {
      return true;
    }
    if (normalizedCode === 'resource-exhausted') {
      return !hasDeviceLimitDetails(error);
    }
  }

  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
        ? ((error as { message: string }).message ?? '')
        : '';

  const normalizedMessage = message.toLowerCase();
  return transientMessageFragments.some((fragment) => normalizedMessage.includes(fragment));
};

export const registerDeviceWithBackoff = async (
  payload: RegisterDevicePayload,
  maxAttempts = 4,
): Promise<void> => {
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await registerDevice(payload);
      return;
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !isTransientRegisterError(error)) {
        throw error;
      }
      const exponentialDelayMs = Math.min(250 * 2 ** (attempt - 1), 2000);
      const jitter = Math.round(Math.random() * 120);
      await sleep(exponentialDelayMs + jitter);
    }
  }

  throw lastError ?? new Error('Device registration failed.');
};

