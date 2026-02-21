import { describe, expect, it } from 'vitest';
import type { I18nStore } from '../i18n/i18n-context';
import { resolveUserFacingErrorMessage } from './user-facing-error';

const createI18n = (dictionary: Record<string, string> = {}): I18nStore => {
  return {
    locale: { value: 'en' },
    direction: { value: 'ltr' },
    dictionary: { value: dictionary },
    ready: { value: true },
  } as unknown as I18nStore;
};

describe('resolveUserFacingErrorMessage', () => {
  it('maps auth invalid credentials to a friendly message', () => {
    const i18n = createI18n({ errorInvalidCredentials: 'Incorrect email or password.' });
    const message = resolveUserFacingErrorMessage(i18n, { code: 'auth/invalid-credential' }, 'auth-signin');
    expect(message).toBe('Incorrect email or password.');
  });

  it('maps gemini payload errors to screenshot guidance', () => {
    const i18n = createI18n({
      analysisFailedScreenshotBody: "We couldn't read this screenshot.",
    });
    const message = resolveUserFacingErrorMessage(
      i18n,
      new Error('Gemini API error (400): Invalid JSON payload received'),
      'offer',
    );
    expect(message).toBe("We couldn't read this screenshot.");
  });

  it('maps gemini quota failures to quota guidance', () => {
    const i18n = createI18n({
      analysisFailedQuotaBody:
        'Screenshot analysis is temporarily unavailable.',
      analysisFailedScreenshotBody: "We couldn't read this screenshot.",
    });
    const message = resolveUserFacingErrorMessage(
      i18n,
      new Error('Gemini API error (429): {"status":"RESOURCE_EXHAUSTED"}'),
      'offer',
    );
    expect(message).toBe('Screenshot analysis is temporarily unavailable.');
  });

  it.each([
    'No offer found in screenshot.',
    'Failed to parse Gemini JSON response.',
    'Gemini response was not JSON.',
    'Unable to extract offer details from the screenshot.',
  ])('maps screenshot extraction failures to screenshot guidance (%s)', (rawMessage) => {
    const i18n = createI18n({
      analysisFailedScreenshotBody: "We couldn't read this screenshot.",
      offerActionFailedMessage: 'Unable to complete this action right now.',
    });
    const message = resolveUserFacingErrorMessage(i18n, new Error(rawMessage), 'offer');
    expect(message).toBe("We couldn't read this screenshot.");
  });

  it('keeps non-offer contexts on their own fallback message', () => {
    const i18n = createI18n({
      analysisFailedScreenshotBody: "We couldn't read this screenshot.",
      helpSubmissionFailed: 'Unable to submit ticket.',
    });
    const message = resolveUserFacingErrorMessage(
      i18n,
      new Error('Gemini response was not JSON.'),
      'help-submit',
    );
    expect(message).toBe('Unable to submit ticket.');
  });

  it('maps unauthenticated style errors to session expired', () => {
    const i18n = createI18n({ errorSessionExpired: 'Your session has expired.' });
    const message = resolveUserFacingErrorMessage(
      i18n,
      new Error('Missing authenticated user.'),
      'help-submit',
    );
    expect(message).toBe('Your session has expired.');
  });

  it('maps duplicate vehicle errors without exposing backend text', () => {
    const i18n = createI18n({
      vehicleLicensePlateDuplicate: 'A vehicle with this plate already exists.',
    });
    const message = resolveUserFacingErrorMessage(
      i18n,
      new Error('Document already exists for plate'),
      'vehicle',
    );
    expect(message).toBe('A vehicle with this plate already exists.');
  });

  it('falls back to context message when no specific mapping is found', () => {
    const i18n = createI18n({
      billingActionFailedMessage: 'Unable to update subscription right now.',
    });
    const message = resolveUserFacingErrorMessage(
      i18n,
      new Error('some opaque backend failure'),
      'billing',
    );
    expect(message).toBe('Unable to update subscription right now.');
  });
});
