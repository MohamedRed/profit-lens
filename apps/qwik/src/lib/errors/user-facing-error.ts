import { t, type I18nStore } from '../i18n/i18n-context';
import { normalizeCallableErrorCode } from '../features/devices/device-registration-error';

export type UserFacingErrorContext =
  | 'auth-signin'
  | 'auth-register'
  | 'offer'
  | 'help-submit'
  | 'help-load'
  | 'profile'
  | 'vehicle'
  | 'billing'
  | 'devices'
  | 'language'
  | 'generic';

const readRawMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim().length > 0) {
      return maybeMessage.trim();
    }
  }
  return '';
};

const readRawCode = (error: unknown): string | null => {
  const callableCode = normalizeCallableErrorCode(error);
  if (callableCode) {
    const normalizedCallable = callableCode.toLowerCase();
    if (normalizedCallable.startsWith('auth/')) {
      return normalizedCallable.slice('auth/'.length);
    }
    return normalizedCallable;
  }
  if (!error || typeof error !== 'object') {
    return null;
  }
  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode !== 'string' || maybeCode.trim().length === 0) {
    return null;
  }
  const normalized = maybeCode.trim().toLowerCase();
  if (normalized.startsWith('auth/')) {
    return normalized.slice('auth/'.length);
  }
  return normalized;
};

const OFFER_SCREENSHOT_FAILURE_PATTERNS = [
  'invalid json payload',
  'generation_config.response_schema',
  'gemini api error',
  'gemini response was not json',
  'failed to parse gemini json',
  'gemini json parse failed',
  'no offer found in screenshot',
  'unable to extract offer details from the screenshot',
  'unable to extract offer',
  'failed to extract offer',
  'missing image payload',
  'invalid image payload',
];

const OFFER_GEMINI_QUOTA_PATTERNS = [
  'resource_exhausted',
  'exceeded your current quota',
  'gemini quota exceeded',
];

const containsAnyPattern = (value: string, patterns: readonly string[]): boolean =>
  patterns.some((pattern) => value.includes(pattern));

const resolveFallbackMessage = (i18n: I18nStore, context: UserFacingErrorContext): string => {
  switch (context) {
    case 'auth-signin':
      return t(
        i18n,
        'signInFailedMessage',
        'Unable to sign in. Check your email and password and try again.',
      );
    case 'auth-register':
      return t(i18n, 'registerFailedMessage', 'Unable to create your account right now. Please try again.');
    case 'offer':
      return t(i18n, 'offerActionFailedMessage', 'Unable to complete this action right now. Please try again.');
    case 'help-submit':
      return t(i18n, 'helpSubmissionFailed', 'Unable to submit ticket. Please try again.');
    case 'help-load':
      return t(i18n, 'helpTicketsLoadFailed', "We couldn't load tickets right now.");
    case 'profile':
      return t(i18n, 'profileSaveFailedMessage', 'Unable to save profile.');
    case 'vehicle':
      return t(i18n, 'vehicleActionFailedMessage', 'Unable to update vehicle right now. Please try again.');
    case 'billing':
      return t(i18n, 'billingActionFailedMessage', 'Unable to update subscription right now. Please try again.');
    case 'devices':
      return t(i18n, 'deviceActionFailedMessage', 'Unable to update device right now. Please try again.');
    case 'language':
      return t(i18n, 'languageSaveFailedMessage', 'Unable to update language right now. Please try again.');
    default:
      return t(i18n, 'genericActionFailedMessage', 'Something went wrong. Please try again.');
  }
};

export const resolveUserFacingErrorMessage = (
  i18n: I18nStore,
  error: unknown,
  context: UserFacingErrorContext = 'generic',
): string => {
  const code = readRawCode(error);
  const message = readRawMessage(error);
  const messageLower = message.toLowerCase();

  if (context === 'offer' && containsAnyPattern(messageLower, OFFER_GEMINI_QUOTA_PATTERNS)) {
    return t(
      i18n,
      'analysisFailedQuotaBody',
      'Screenshot analysis is temporarily unavailable. Enter details manually and try again later.',
    );
  }

  if (context === 'offer' && containsAnyPattern(messageLower, OFFER_SCREENSHOT_FAILURE_PATTERNS)) {
    return t(
      i18n,
      'analysisFailedScreenshotBody',
      "We couldn't read this screenshot. Please upload a valid offer screenshot.",
    );
  }

  if (messageLower.includes('missing authenticated user') || messageLower.includes('unauthenticated')) {
    return t(i18n, 'errorSessionExpired', 'Your session has expired. Please sign in again.');
  }

  if (messageLower.includes('paid plan is unavailable')) {
    return t(i18n, 'errorPlanUnavailable', 'No paid plan is available right now. Please try again later.');
  }

  if (messageLower.includes('already exists') && context === 'vehicle') {
    return t(i18n, 'vehicleLicensePlateDuplicate', 'A vehicle with this plate already exists.');
  }

  if (messageLower.includes('device not registered')) {
    return t(
      i18n,
      'deviceNotRegisteredMessage',
      'This device is not registered on your account yet. Refresh and try again.',
    );
  }

  switch (code) {
    case 'invalid-email':
      return t(i18n, 'errorInvalidEmail', 'Enter a valid email address.');
    case 'invalid-credential':
    case 'invalid-login-credentials':
    case 'user-not-found':
    case 'wrong-password':
      return t(i18n, 'errorInvalidCredentials', 'Incorrect email or password.');
    case 'email-already-in-use':
      return t(i18n, 'errorEmailAlreadyInUse', 'This email is already used by another account.');
    case 'weak-password':
      return t(i18n, 'errorWeakPassword', 'Password is too weak. Use at least 8 characters.');
    case 'too-many-requests':
    case 'resource-exhausted':
      return t(i18n, 'errorTooManyRequests', 'Too many attempts. Please wait a moment and try again.');
    case 'network-request-failed':
    case 'unavailable':
    case 'deadline-exceeded':
      return t(i18n, 'errorNetworkUnavailable', 'Network issue. Check your connection and try again.');
    case 'permission-denied':
      return t(
        i18n,
        'errorPermissionDenied',
        "You don't have permission to do this action on this account.",
      );
    case 'unauthenticated':
      return t(i18n, 'errorSessionExpired', 'Your session has expired. Please sign in again.');
    default:
      return resolveFallbackMessage(i18n, context);
  }
};
