import { describe, expect, it } from 'vitest';
import {
  isIosInstallManualOnly,
  isRunningAsInstalledPwa,
  shouldEnforcePwaInstallGate,
  type PwaWindowLike,
} from './pwa-install-state';

const browserWithMatches = (matchingQueries: string[]): PwaWindowLike => {
  return {
    matchMedia: (query: string) => ({ matches: matchingQueries.includes(query) }),
    navigator: {},
  };
};

describe('pwa-install-state', () => {
  it('returns false without a browser object', () => {
    expect(isRunningAsInstalledPwa(undefined)).toBe(false);
  });

  it('returns true when running in iOS standalone mode', () => {
    expect(isRunningAsInstalledPwa({ navigator: { standalone: true } })).toBe(true);
  });

  it('returns true when standalone display mode matches', () => {
    expect(isRunningAsInstalledPwa(browserWithMatches(['(display-mode: standalone)']))).toBe(true);
  });

  it('returns true when fullscreen display mode matches', () => {
    expect(isRunningAsInstalledPwa(browserWithMatches(['(display-mode: fullscreen)']))).toBe(true);
  });

  it('returns false when no install mode matches', () => {
    expect(isRunningAsInstalledPwa(browserWithMatches([]))).toBe(false);
  });

  it('returns true when iPhone user-agent requires manual install flow', () => {
    expect(
      isIosInstallManualOnly({
        navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' },
      }),
    ).toBe(true);
  });

  it('returns true for iPadOS desktop-mode detection', () => {
    expect(
      isIosInstallManualOnly({
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
          maxTouchPoints: 5,
        },
      }),
    ).toBe(true);
  });

  it('returns false for non-iOS desktop browsers', () => {
    expect(
      isIosInstallManualOnly({
        navigator: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          platform: 'Win32',
          maxTouchPoints: 0,
        },
      }),
    ).toBe(false);
  });

  it('returns false for already-installed iOS PWA', () => {
    expect(
      isIosInstallManualOnly({
        navigator: { standalone: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)' },
      }),
    ).toBe(false);
  });

  it('enforces install gate on Android mobile user agent', () => {
    expect(
      shouldEnforcePwaInstallGate({
        navigator: {
          userAgent:
            'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36',
        },
      }),
    ).toBe(true);
  });

  it('does not enforce install gate on desktop browser user agent', () => {
    expect(
      shouldEnforcePwaInstallGate({
        navigator: {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          platform: 'Win32',
          maxTouchPoints: 0,
        },
        matchMedia: () => ({ matches: false }),
      }),
    ).toBe(false);
  });

  it('does not enforce install gate on desktop platform even with spoofed mobile UA', () => {
    expect(
      shouldEnforcePwaInstallGate({
        navigator: {
          userAgent:
            'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
          platform: 'MacIntel',
          maxTouchPoints: 0,
        },
        matchMedia: () => ({ matches: false }),
      }),
    ).toBe(false);
  });

  it('does not enforce install gate when pointer is fine and no touch points are reported', () => {
    expect(
      shouldEnforcePwaInstallGate({
        navigator: {
          userAgent: 'CustomDesktopBrowser',
          platform: '',
          maxTouchPoints: 0,
        },
        matchMedia: (query: string) => ({ matches: query === '(pointer: fine)' }),
      }),
    ).toBe(false);
  });

  it('does not enforce install gate on desktop with coarse pointer only', () => {
    expect(
      shouldEnforcePwaInstallGate({
        navigator: {
          userAgent:
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          platform: 'Win32',
          maxTouchPoints: 1,
        },
        matchMedia: (query: string) => ({ matches: query === '(pointer: coarse)' }),
      }),
    ).toBe(false);
  });

  it('enforces install gate for iPadOS desktop mode', () => {
    expect(
      shouldEnforcePwaInstallGate({
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
          platform: 'MacIntel',
          maxTouchPoints: 5,
        },
        matchMedia: () => ({ matches: false }),
      }),
    ).toBe(true);
  });
});
