import { describe, expect, it } from 'vitest';
import { shouldUseDirectGalleryImport } from './offer-import-platform';

const browser = (input: {
  userAgent: string;
  platform?: string;
  maxTouchPoints?: number;
}): Window => {
  return {
    navigator: {
      userAgent: input.userAgent,
      platform: input.platform ?? '',
      maxTouchPoints: input.maxTouchPoints ?? 0,
    },
  } as unknown as Window;
};

describe('offer-import-platform', () => {
  it('uses direct gallery on iPhone', () => {
    const value = shouldUseDirectGalleryImport(
      browser({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)',
      }),
    );
    expect(value).toBe(true);
  });

  it('uses direct gallery on iPad desktop mode', () => {
    const value = shouldUseDirectGalleryImport(
      browser({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      }),
    );
    expect(value).toBe(true);
  });

  it('uses source chooser on Android', () => {
    const value = shouldUseDirectGalleryImport(
      browser({
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
      }),
    );
    expect(value).toBe(false);
  });

  it('uses source chooser on desktop browsers', () => {
    const value = shouldUseDirectGalleryImport(
      browser({
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        platform: 'Win32',
      }),
    );
    expect(value).toBe(false);
  });

  it('uses source chooser without browser object', () => {
    expect(shouldUseDirectGalleryImport(undefined)).toBe(false);
  });
});
